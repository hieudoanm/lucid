import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponse {
  @ApiProperty({ example: 1, description: 'Unique ID of the audit log' })
  id: number;

  @ApiProperty({ example: 'CREATE', description: 'Action performed' })
  action: string;

  @ApiProperty({
    example: 'Account',
    description: 'Type of entity being acted upon',
  })
  entityType: string;

  @ApiProperty({ example: 101, description: 'ID of the affected entity' })
  entityId: number;

  @ApiProperty({
    example: 'Created new account with ID 101',
    description: 'Detailed message of the action',
  })
  message: string;

  @ApiProperty({
    example: 'admin',
    description: 'User who performed the action',
  })
  createdBy: string;

  @ApiProperty({
    example: '2025-09-23T10:00:00Z',
    description: 'Timestamp when created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-23T10:00:00Z',
    description: 'Timestamp when updated',
  })
  updatedAt: Date;

  constructor(init?: Partial<AuditLogResponse>) {
    Object.assign(this, init);
  }
}
