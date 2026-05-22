import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
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
}
