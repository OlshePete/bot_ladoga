import { Controller, Get } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService:TaskService ) {}
    @Get('add')
   async  addNewTask(): Promise<string> {
      const res = await this.taskService.addNewTask();
      if (!res) return "missed"
      return res
    }
}
