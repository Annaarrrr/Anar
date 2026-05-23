import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from './common/auth.guard';

@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: { user: { id: string } }) {
    return this.taskService.updateTask(id, req.user.id, updateTaskDto.completed);
  }
}
