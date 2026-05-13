import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('AI Analysis')
@ApiBearerAuth()
@Controller('players')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get(':id/ai-analysis')
  @ApiOperation({ summary: 'Get AI-generated narrative analysis of player evolution' })
  analyze(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.analyzePlayer(id);
  }
}
