import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from './common/auth.guard';

@Controller('goal')
@UseGuards(AuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async create(@Body() createGoalDto: CreateGoalDto, @Request() req: { user: { id: string } }) {
    return this.goalService.createGoal(req.user.id, createGoalDto.goalText);
  }

  @Get()
  async get(@Request() req: { user: { id: string } }) {
    return this.goalService.getGoal(req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req: { user: { id: string } }
  ) {
    const ok = await this.goalService.updateGoal(id, req.user.id, updateGoalDto.goalText);
    if (!ok) {
      throw new NotFoundException('Goal not found or unauthorized');
    }
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    const ok = await this.goalService.deleteGoal(id, req.user.id);
    if (!ok) {
      throw new NotFoundException('Goal not found or unauthorized');
    }
    return { success: true };
  }
}

