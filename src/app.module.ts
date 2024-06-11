import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import * as LocalSession from 'telegraf-session-local'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Context } from 'telegraf';

export const sessions = new LocalSession<Context>({database:'session_db.json'})

@Module({
  imports: [
    TaskModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      middlewares:[sessions.middleware()],
      token:new ConfigService().get<string>('BOT_TOKEN')
    })
  ],
  providers: [AppService, AppController],
})
export class AppModule {}
