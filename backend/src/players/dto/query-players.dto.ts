import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPlayersDto {
  @ApiPropertyOptional({ description: 'Search by player name', example: 'Messi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by club name', example: 'Barcelona' })
  @IsOptional()
  @IsString()
  club?: string;

  @ApiPropertyOptional({ description: 'Filter by position', example: 'ST' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Filter by nationality', example: 'Argentina' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Filter by gender', enum: ['male', 'female'] })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @ApiPropertyOptional({ description: 'Filter by FIFA version', example: '22' })
  @IsOptional()
  @IsString()
  fifa_version?: string;

  @ApiPropertyOptional({ description: 'Min overall rating', example: 80 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minOverall?: number;

  @ApiPropertyOptional({ description: 'Max overall rating', example: 99 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(99)
  maxOverall?: number;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
