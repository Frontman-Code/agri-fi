import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_name' })
  entityName: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column({ length: 20 })
  action: string;

  @Column({ type: 'text', nullable: true })
  changes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
