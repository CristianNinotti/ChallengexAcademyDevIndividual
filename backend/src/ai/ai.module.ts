import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Player } from '../players/entities/player.entity';

@Module({
  imports: [SequelizeModule.forFeature([Player])],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
