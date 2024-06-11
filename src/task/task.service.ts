import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TaskService {
  constructor(private readonly eventEmitter: EventEmitter2){}
  async addNewTask (): Promise<string> {
     const res = await this.eventEmitter.emit(
        'order.created',
        {
          orderId: 1,
          payload: "text custom",
        },
      );

      if (res){
        return 'запроc успешно обработан';
      }
      return 'запроc успешно принят';
    }
}
