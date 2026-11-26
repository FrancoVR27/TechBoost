
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getHello() {
    return {
      message: 'Conexion exitosa entre React y NestJS',
      backend: 'NestJS',
      database: 'Supabase PostgreSQL'
    };
  }
}
