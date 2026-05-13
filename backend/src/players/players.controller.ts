import {
  Controller, Get, Post, Patch, Body, Param, Query,
  ParseIntPipe, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { PlayersService } from './players.service';
import { QueryPlayersDto } from './dto/query-players.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@ApiTags('Players')
@ApiBearerAuth()
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of players with filters' })
  findAll(@Query() query: QueryPlayersDto) {
    return this.playersService.findAll(query);
  }

  @Get('export/xlsx')
  @ApiOperation({ summary: 'Export filtered players as XLSX' })
  exportXlsx(@Query() query: QueryPlayersDto, @Res() res: Response) {
    return this.playersService.exportXlsx(query, res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export filtered players as CSV' })
  exportCsv(@Query() query: QueryPlayersDto, @Res() res: Response) {
    return this.playersService.exportCsv(query, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a single player' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get skill evolution timeline for a player across FIFA versions' })
  getTimeline(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.getTimeline(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new player' })
  @ApiResponse({ status: 201, description: 'Player created successfully' })
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update player information and skills' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, dto);
  }
}
