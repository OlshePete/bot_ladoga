import { Controller, Get } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectBot, Start, Update, Action, Ctx } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { sessions } from './app.module';
import { AppService } from './app.service';
import {IBotMessage, Task} from './types/bot_types'
import { checkOrderStatus, generateNotificationMessage, updateOrderStatus } from './utils';
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
  @Action(/take_to_work_(\d+)/)
  async handleTakeToWorkAction( @Ctx() ctx: Context) {
    // @ts-ignore
    const taskId = ctx.match[1];
    let username = ''
    if('callback_query' in ctx.update) {
      username = ctx.update.callback_query.from.username
    }
    // Execute your function here
    Object.keys(ctx).forEach(k=>console.log(k,ctx[k]))
    console.log(`Button clicked for task ${taskId} by ${username}!`, );
    // You can also respond to the user with a message
    //
    const res = await checkOrderStatus(taskId)
    console.log(res);
    if(res) {
      //заказа уже взят в работу - ответить что заказ взят в работу
      ctx.reply(`Заказ №${taskId} уже взят в работу`);
    } else {
      //если не взят - запрос на изменение статуса и после успешного ответа отрпавка всем подписчикам сообщения что заказ взят в работу 
      try {
        const update = await updateOrderStatus(taskId)
        if(update) {
            const localSessions = sessions.DB as any
            if ('getState' in localSessions) {
            const sessions = localSessions.getState() as {
              sessions:Array<{id:string,data:any}>
            }
            Array.isArray(sessions.sessions) && sessions?.sessions.forEach((session,session_id, {length}) => {
              const chatId = session.id.split(':')[0]; 
              this.bot.telegram.sendMessage(chatId, `Заказ №${taskId} взят в работу ${username}`)
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
      } catch (error) {
        console.error(error)
        throw new Error('Изменение статуса не выполнено')
      }
    } 
  }
  @OnEvent('order.created')
  async handleOrderCreatedEvent(payload: Task) {
    const localSessions = sessions.DB as any
    if ('getState' in localSessions) {
      const sessions = localSessions.getState() as {
        sessions:Array<{id:string,data:any}>
      }
      console.log('________________ ',JSON.stringify(payload))
      console.log('Всего подписчиков: ',sessions.sessions.length)
      const message = `Новый заказ с сайта: ${generateNotificationMessage(payload)}`;
      const markup = {
        inline_keyboard: [
          [{ text: 'Взять в работу', callback_data: `take_to_work_${payload.data.id}` }],
        ],
      };
      Array.isArray(sessions.sessions) && sessions?.sessions.forEach((session,session_id, {length}) => {
        const chatId = session.id.split(':')[0]; 
        this.bot.telegram.sendMessage(chatId, `Новый заказ с сайта: ${generateNotificationMessage(payload)}`,{parse_mode: "Markdown", reply_markup: markup })
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
