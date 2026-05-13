import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { Player } from '../players/entities/player.entity';

@Module({
  imports: [SequelizeModule.forFeature([Player])],
  providers: [ImportService],
  controllers: [ImportController],
})
export class ImportModule {}
