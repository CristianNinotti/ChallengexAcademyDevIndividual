import {
  Table, Column, Model, DataType, CreatedAt, UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'players', timestamps: false })
export class Player extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  fifa_version: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  fifa_update: string;

  @Column({ type: DataType.STRING(255) })
  player_face_url: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  long_name: string;

  @Column({ type: DataType.STRING(255) })
  player_positions: string;

  @Column({ type: DataType.STRING(255) })
  club_name: string;

  @Column({ type: DataType.STRING(255) })
  nationality_name: string;

  @Column({ type: DataType.INTEGER })
  overall: number;

  @Column({ type: DataType.INTEGER })
  potential: number;

  @Column({ type: DataType.INTEGER })
  value_eur: number;

  @Column({ type: DataType.INTEGER })
  wage_eur: number;

  @Column({ type: DataType.INTEGER })
  age: number;

  @Column({ type: DataType.INTEGER })
  height_cm: number;

  @Column({ type: DataType.INTEGER })
  weight_kg: number;

  @Column({ type: DataType.STRING(50) })
  preferred_foot: string;

  @Column({ type: DataType.INTEGER })
  weak_foot: number;

  @Column({ type: DataType.INTEGER })
  skill_moves: number;

  @Column({ type: DataType.INTEGER })
  international_reputation: number;

  @Column({ type: DataType.STRING(100) })
  work_rate: string;

  @Column({ type: DataType.STRING(100) })
  body_type: string;

  // Core stats
  @Column({ type: DataType.INTEGER }) pace: number;
  @Column({ type: DataType.INTEGER }) shooting: number;
  @Column({ type: DataType.INTEGER }) passing: number;
  @Column({ type: DataType.INTEGER }) dribbling: number;
  @Column({ type: DataType.INTEGER }) defending: number;
  @Column({ type: DataType.INTEGER }) physic: number;

  // Attacking
  @Column({ type: DataType.INTEGER }) attacking_crossing: number;
  @Column({ type: DataType.INTEGER }) attacking_finishing: number;
  @Column({ type: DataType.INTEGER }) attacking_heading_accuracy: number;
  @Column({ type: DataType.INTEGER }) attacking_short_passing: number;
  @Column({ type: DataType.INTEGER }) attacking_volleys: number;

  // Skill
  @Column({ type: DataType.INTEGER }) skill_dribbling: number;
  @Column({ type: DataType.INTEGER }) skill_curve: number;
  @Column({ type: DataType.INTEGER }) skill_fk_accuracy: number;
  @Column({ type: DataType.INTEGER }) skill_long_passing: number;
  @Column({ type: DataType.INTEGER }) skill_ball_control: number;

  // Movement
  @Column({ type: DataType.INTEGER }) movement_acceleration: number;
  @Column({ type: DataType.INTEGER }) movement_sprint_speed: number;
  @Column({ type: DataType.INTEGER }) movement_agility: number;
  @Column({ type: DataType.INTEGER }) movement_reactions: number;
  @Column({ type: DataType.INTEGER }) movement_balance: number;

  // Power
  @Column({ type: DataType.INTEGER }) power_shot_power: number;
  @Column({ type: DataType.INTEGER }) power_jumping: number;
  @Column({ type: DataType.INTEGER }) power_stamina: number;
  @Column({ type: DataType.INTEGER }) power_strength: number;
  @Column({ type: DataType.INTEGER }) power_long_shots: number;

  // Mentality
  @Column({ type: DataType.INTEGER }) mentality_aggression: number;
  @Column({ type: DataType.INTEGER }) mentality_interceptions: number;
  @Column({ type: DataType.INTEGER }) mentality_positioning: number;
  @Column({ type: DataType.INTEGER }) mentality_vision: number;
  @Column({ type: DataType.INTEGER }) mentality_penalties: number;
  @Column({ type: DataType.INTEGER }) mentality_composure: number;

  // Defending
  @Column({ type: DataType.INTEGER }) defending_marking: number;
  @Column({ type: DataType.INTEGER }) defending_standing_tackle: number;
  @Column({ type: DataType.INTEGER }) defending_sliding_tackle: number;

  // Goalkeeping
  @Column({ type: DataType.INTEGER }) goalkeeping_diving: number;
  @Column({ type: DataType.INTEGER }) goalkeeping_handling: number;
  @Column({ type: DataType.INTEGER }) goalkeeping_kicking: number;
  @Column({ type: DataType.INTEGER }) goalkeeping_positioning: number;
  @Column({ type: DataType.INTEGER }) goalkeeping_reflexes: number;
  @Column({ type: DataType.INTEGER }) goalkeeping_speed: number;

  // Player traits / tags
  @Column({ type: DataType.TEXT }) player_tags: string;
  @Column({ type: DataType.TEXT }) player_traits: string;

  // Gender discriminator (added for combined male+female support)
  @Column({ type: DataType.ENUM('male', 'female'), defaultValue: 'male' })
  gender: string;
}
