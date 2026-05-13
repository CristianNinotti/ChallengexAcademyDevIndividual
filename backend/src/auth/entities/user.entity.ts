import {
  Table, Column, Model, DataType, CreatedAt, UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password: string;

  @Column({ type: DataType.ENUM('admin', 'viewer'), defaultValue: 'viewer' })
  role: string;

  @CreatedAt
  created_at: Date;
}
