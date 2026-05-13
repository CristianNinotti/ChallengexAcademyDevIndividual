import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Player } from './entities/player.entity';
import { QueryPlayersDto } from './dto/query-players.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player) private playerModel: typeof Player) {}

  // ─── Build WHERE clause from filters ─────────────────────────────────────────
  private buildWhere(query: QueryPlayersDto) {
    const where: any = {};
    if (query.name)
      where.long_name = { [Op.like]: `%${query.name}%` };
    if (query.club)
      where.club_name = { [Op.like]: `%${query.club}%` };
    if (query.position)
      where.player_positions = { [Op.like]: `%${query.position}%` };
    if (query.nationality)
      where.nationality_name = { [Op.like]: `%${query.nationality}%` };
    if (query.gender)
      where.gender = query.gender;
    if (query.fifa_version)
      where.fifa_version = query.fifa_version;
    if (query.minOverall !== undefined || query.maxOverall !== undefined) {
      where.overall = {};
      if (query.minOverall !== undefined) where.overall[Op.gte] = query.minOverall;
      if (query.maxOverall !== undefined) where.overall[Op.lte] = query.maxOverall;
    }
    return where;
  }

  // ─── LIST (paginated + filtered) ─────────────────────────────────────────────
  async findAll(query: QueryPlayersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const where = this.buildWhere(query);

    const { count, rows } = await this.playerModel.findAndCountAll({
      where,
      limit,
      offset,
      attributes: [
        'id', 'long_name', 'player_positions', 'club_name',
        'nationality_name', 'overall', 'potential', 'age',
        'fifa_version', 'player_face_url', 'gender', 'pace',
        'shooting', 'passing', 'dribbling', 'defending', 'physic',
      ],
      order: [['overall', 'DESC']],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  // ─── DETAIL ───────────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const player = await this.playerModel.findByPk(id);
    if (!player) throw new NotFoundException(`Player #${id} not found`);
    return player;
  }

  // ─── TIMELINE (all versions of a player by name) ──────────────────────────────
  async getTimeline(id: number) {
    const base = await this.findOne(id);
    const records = await this.playerModel.findAll({
      where: { long_name: base.long_name, gender: base.gender },
      attributes: [
        'id', 'fifa_version', 'overall', 'potential', 'age', 'club_name',
        'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
        'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy',
        'attacking_short_passing', 'attacking_volleys',
        'skill_dribbling', 'skill_curve', 'skill_fk_accuracy',
        'skill_long_passing', 'skill_ball_control',
        'movement_acceleration', 'movement_sprint_speed', 'movement_agility',
        'movement_reactions', 'movement_balance',
        'power_shot_power', 'power_jumping', 'power_stamina',
        'power_strength', 'power_long_shots',
        'mentality_aggression', 'mentality_interceptions',
        'mentality_positioning', 'mentality_vision',
        'mentality_penalties', 'mentality_composure',
        'defending_marking', 'defending_standing_tackle', 'defending_sliding_tackle',
        'goalkeeping_diving', 'goalkeeping_handling', 'goalkeeping_kicking',
        'goalkeeping_positioning', 'goalkeeping_reflexes',
      ],
      order: [['fifa_version', 'ASC']],
    });
    return { player: base.long_name, gender: base.gender, timeline: records };
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────────
  async create(dto: CreatePlayerDto) {
    const player = await this.playerModel.create({
      ...dto,
      fifa_version: dto.fifa_version ?? 'custom',
      fifa_update: dto.fifa_update ?? '1',
      player_face_url: '',
    } as any);
    return player;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdatePlayerDto) {
    const player = await this.findOne(id);
    await player.update(dto);
    return player.reload();
  }

  // ─── EXPORT (XLSX) ───────────────────────────────────────────────────────────
  async exportXlsx(query: QueryPlayersDto, res: Response) {
    const where = this.buildWhere(query);
    const players = await this.playerModel.findAll({
      where,
      limit: 5000,
      order: [['overall', 'DESC']],
      attributes: [
        'id', 'long_name', 'player_positions', 'club_name',
        'nationality_name', 'overall', 'potential', 'age',
        'fifa_version', 'gender', 'pace', 'shooting', 'passing',
        'dribbling', 'defending', 'physic', 'preferred_foot',
        'value_eur', 'wage_eur',
      ],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Players');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Name', key: 'long_name', width: 30 },
      { header: 'Positions', key: 'player_positions', width: 15 },
      { header: 'Club', key: 'club_name', width: 25 },
      { header: 'Nationality', key: 'nationality_name', width: 20 },
      { header: 'Overall', key: 'overall', width: 10 },
      { header: 'Potential', key: 'potential', width: 10 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'FIFA Version', key: 'fifa_version', width: 12 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Pace', key: 'pace', width: 8 },
      { header: 'Shooting', key: 'shooting', width: 10 },
      { header: 'Passing', key: 'passing', width: 10 },
      { header: 'Dribbling', key: 'dribbling', width: 10 },
      { header: 'Defending', key: 'defending', width: 10 },
      { header: 'Physical', key: 'physic', width: 10 },
      { header: 'Preferred Foot', key: 'preferred_foot', width: 14 },
      { header: 'Value (EUR)', key: 'value_eur', width: 14 },
      { header: 'Wage (EUR)', key: 'wage_eur', width: 14 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a5276' },
    };

    players.forEach(p => sheet.addRow(p.toJSON()));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="fifa_players.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  }

  // ─── EXPORT (CSV) ────────────────────────────────────────────────────────────
  async exportCsv(query: QueryPlayersDto, res: Response) {
    const where = this.buildWhere(query);
    const players = await this.playerModel.findAll({
      where,
      limit: 5000,
      order: [['overall', 'DESC']],
      attributes: [
        'id', 'long_name', 'player_positions', 'club_name',
        'nationality_name', 'overall', 'potential', 'age',
        'fifa_version', 'gender', 'pace', 'shooting', 'passing',
        'dribbling', 'defending', 'physic',
      ],
    });

    const headers = [
      'ID', 'Name', 'Positions', 'Club', 'Nationality',
      'Overall', 'Potential', 'Age', 'FIFA Version', 'Gender',
      'Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical',
    ];
    const fields: (keyof any)[] = [
      'id', 'long_name', 'player_positions', 'club_name', 'nationality_name',
      'overall', 'potential', 'age', 'fifa_version', 'gender',
      'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
    ];

    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [headers.map(escape).join(',')];
    players.forEach(p => {
      const data = p.toJSON() as any;
      rows.push(fields.map(f => escape(data[f])).join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="fifa_players.csv"');
    res.send(rows.join('\n'));
  }
}
