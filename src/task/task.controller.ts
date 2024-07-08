import { Controller, Post, Body } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('bot/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('add')
  async addNewTask(@Body() taskData: any): Promise<string> {
    const res = await this.taskService.addNewTask(taskData);
    if (!res) return "missed"
    return res
  }
}