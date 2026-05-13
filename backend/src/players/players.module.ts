import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './entities/player.entity';

@Module({
  imports: [SequelizeModule.forFeature([Player])],
  providers: [PlayersService],
  controllers: [PlayersController],
  exports: [PlayersService, SequelizeModule],
})
export class PlayersModule {}
