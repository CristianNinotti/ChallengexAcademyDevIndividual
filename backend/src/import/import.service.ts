import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Player } from '../players/entities/player.entity';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(@InjectModel(Player) private playerModel: typeof Player) {}

  async importCsv(buffer: Buffer): Promise<{ imported: number; skipped: number; errors: number }> {
    const rows: any[] = await this.parseCsv(buffer);
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH).map(r => this.normalizeRow(r));
      try {
        await this.playerModel.bulkCreate(batch, {
          ignoreDuplicates: true,
          validate: false,
        });
        imported += batch.length;
      } catch (e) {
        this.logger.error(`Batch error at offset ${i}: ${e.message}`);
        errors += batch.length;
      }
    }

    return { imported, skipped, errors };
  }

  private parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csv())
        .on('data', data => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private normalizeRow(row: any) {
    const toInt = (v: any) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? null : n;
    };
    return {
      fifa_version: row.fifa_version || row['FIFA Version'] || 'unknown',
      fifa_update: row.fifa_update || row['FIFA Update'] || '1',
      player_face_url: row.player_face_url || '',
      long_name: row.long_name || row['Long Name'] || '',
      player_positions: row.player_positions || row['Positions'] || '',
      club_name: row.club_name || row['Club'] || null,
      nationality_name: row.nationality_name || row['Nationality'] || null,
      overall: toInt(row.overall || row['Overall']),
      potential: toInt(row.potential || row['Potential']),
      value_eur: toInt(row.value_eur || row['Value(EUR)']),
      wage_eur: toInt(row.wage_eur || row['Wage(EUR)']),
      age: toInt(row.age || row['Age']),
      height_cm: toInt(row.height_cm || row['Height(cm)']),
      weight_kg: toInt(row.weight_kg || row['Weight(kg)']),
      preferred_foot: row.preferred_foot || row['Preferred Foot'] || null,
      pace: toInt(row.pace || row['Pace']),
      shooting: toInt(row.shooting || row['Shooting']),
      passing: toInt(row.passing || row['Passing']),
      dribbling: toInt(row.dribbling || row['Dribbling']),
      defending: toInt(row.defending || row['Defending']),
      physic: toInt(row.physic || row['Physical']),
      gender: row.gender || 'male',
    };
  }
}
