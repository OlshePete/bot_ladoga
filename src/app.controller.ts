import { Controller, Get } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { sessions } from './app.module';
import { AppService } from './app.service';
import {IBotMessage} from './types/bot_types'
@Update()
export class AppController {
  constructor(
    @InjectBot() private readonly bot:Telegraf<Context>, 
    private readonly appService: AppService,
    private eventEmitter: EventEmitter2
    ) {}

  @Start()
  async startCommand(ctx: Context){
    await ctx.reply('Добро пожаловать в систему оповещения заказов!')
  }
 
  @OnEvent('order.created')
  async handleOrderCreatedEvent(payload: string) {
    const localSessions = sessions.DB as any
    if ('getState' in localSessions) {
      const sessions = localSessions.getState() as {
        sessions:Array<{id:string,data:any}>
      }
      console.log('Всего подписчиков: ',sessions.sessions.length)
      Array.isArray(sessions.sessions) && sessions?.sessions.forEach((session,session_id, {length}) => {
        const chatId = session.id.split(':')[0]; 
        this.bot.telegram.sendMessage(chatId, `Магия! Новый заказ создан: ${JSON.stringify(payload)}`)
          .then((res)=> {
            const {chat, date} = res as IBotMessage
            const formatedDate =  new Date(date * 1000).toLocaleString()
            console.log(formatedDate,'\nСообщение успешно отправлено пользователю: ', chat.username)
          })
          .catch(error=>{
            console.error('Отправка не удалась! Пользователь заблокировал бота', error.response.description)
          })
      });
    }
  }

}
