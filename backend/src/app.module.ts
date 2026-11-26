import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseApiModule } from './database-api.module.js';
import { IaPredictivaModule } from './ia-predictiva/ia-predictiva.module.js';
import { FinanceModule } from './finance/finance.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),

        autoLoadEntities: true,
        synchronize: false,

        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    AuthModule,
    DatabaseApiModule,
    IaPredictivaModule,
    FinanceModule,
  ],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}