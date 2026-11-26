import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity.js';
import { LoginThrottleService } from './login-throttle.service.js';
import { hashPassword, verifyPassword } from './password.js';
import { TokenService } from './token.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128; // scrypt con claves enormes = vector de DoS

export interface PublicUser {
  usuarioId: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  planId: number | null;
  estado: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
}

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);
  private dummyHash?: Promise<string>;

  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly tokens: TokenService,
    private readonly throttle: LoginThrottleService,
    private readonly config: ConfigService,
  ) {}

  /** Crea el primer Admin a partir de ADMIN_EMAIL / ADMIN_PASSWORD si no existe ninguno. */
  async onApplicationBootstrap(): Promise<void> {
    const correo = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!correo || !password) {
      return;
    }

    try {
      const admins = await this.usuarios.count({ where: { rol: 'Admin' } });
      if (admins > 0) {
        return;
      }
      await this.usuarios.save(
        this.usuarios.create({
          nombre: 'Administrador',
          apellido: 'TECH BOOST',
          correo: correo.trim().toLowerCase(),
          contrasenaHash: await hashPassword(password),
          rol: 'Admin',
          planId: null,
          estado: 'activo',
        }),
      );
      this.logger.log(`Administrador inicial creado: ${correo}`);
    } catch (error) {
      this.logger.error('No se pudo crear el administrador inicial', error);
    }
  }

  async register(body: unknown): Promise<AuthSession> {
    const data = this.asObject(body);
    const nombre = this.requiredText(data.nombre, 'nombre', 100);
    const apellido = this.requiredText(data.apellido, 'apellido', 100);
    const correo = this.parseEmail(data.correo);
    const password = this.parsePassword(data.contrasena);

    const existing = await this.usuarios.findOneBy({ correo });
    if (existing) {
      throw new ConflictException('Ese correo ya está registrado');
    }

    // El rol, plan y estado NUNCA vienen del cliente: todo registro público es Cliente en prueba.
    const usuario = await this.usuarios.save(
      this.usuarios.create({
        nombre,
        apellido,
        correo,
        contrasenaHash: await hashPassword(password),
        rol: 'Cliente',
        planId: 1,
        estado: 'prueba',
      }),
    );

    return this.session(usuario);
  }

  async login(body: unknown, ip: string): Promise<AuthSession> {
    const data = this.asObject(body);
    const correo = this.parseEmail(data.correo);
    const password = typeof data.contrasena === 'string' ? data.contrasena : '';
    if (!password || password.length > MAX_PASSWORD) {
      throw new BadRequestException('La contraseña es obligatoria');
    }

    const throttleKey = `${ip}|${correo}`;
    this.throttle.assertAllowed(throttleKey);

    const usuario = await this.usuarios.findOneBy({ correo });
    // Si el usuario no existe igual se calcula un hash, para que el tiempo de respuesta no delate qué correos existen.
    const valid = usuario
      ? await verifyPassword(password, usuario.contrasenaHash)
      : await verifyPassword(password, await this.getDummyHash());

    if (!usuario || !valid) {
      this.throttle.registerFailure(throttleKey);
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    if (usuario.estado === 'suspendido') {
      throw new ForbiddenException('Tu cuenta está suspendida');
    }

    this.throttle.reset(throttleKey);
    return this.session(usuario);
  }

  async me(usuarioId: string): Promise<PublicUser> {
    const usuario = await this.usuarios.findOneBy({ usuarioId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (usuario.estado === 'suspendido') {
      throw new ForbiddenException('Tu cuenta está suspendida');
    }
    return this.toPublic(usuario);
  }

  private session(usuario: Usuario): AuthSession {
    return {
      accessToken: this.tokens.sign({
        sub: usuario.usuarioId,
        correo: usuario.correo,
        rol: usuario.rol,
        planId: usuario.planId,
      }),
      tokenType: 'Bearer',
      expiresIn: this.tokens.ttlSeconds,
      user: this.toPublic(usuario),
    };
  }

  private toPublic(usuario: Usuario): PublicUser {
    return {
      usuarioId: usuario.usuarioId,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
      planId: usuario.planId,
      estado: usuario.estado,
    };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= hashPassword('contrasena-de-relleno');
    return this.dummyHash;
  }

  private asObject(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON');
    }
    return body as Record<string, unknown>;
  }

  private requiredText(value: unknown, field: string, max: number): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`El campo ${field} es obligatorio`);
    }
    const text = value.trim();
    if (text.length > max) {
      throw new BadRequestException(`El campo ${field} es demasiado largo`);
    }
    return text;
  }

  private parseEmail(value: unknown): string {
    const correo = this.requiredText(value, 'correo', 150).toLowerCase();
    if (!EMAIL_REGEX.test(correo)) {
      throw new BadRequestException('El correo no es válido');
    }
    return correo;
  }

  private parsePassword(value: unknown): string {
    if (typeof value !== 'string' || value.length < MIN_PASSWORD) {
      throw new BadRequestException(
        `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`,
      );
    }
    if (value.length > MAX_PASSWORD) {
      throw new BadRequestException('La contraseña es demasiado larga');
    }
    return value;
  }
}
