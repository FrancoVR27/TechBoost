import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/auth.decorators.js';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello() {
    return {
      message: 'Conexion exitosa entre React y NestJS',
      backend: 'NestJS',
      database: 'Supabase PostgreSQL',
    };
  }
}
