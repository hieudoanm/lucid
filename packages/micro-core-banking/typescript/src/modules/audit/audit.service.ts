import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditLogResponse } from './audit.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}
  /**
   * Create a simple audit log entry.
   *
   * @param action The action performed (e.g., CREATE, UPDATE, DELETE, TRANSFER)
   * @param entityType The type of entity (e.g., Account, Transaction)
   * @param entityId The unique identifier of the entity
   * @param message Additional details or description
   * @param createdBy User or system that performed the action
   * @returns The saved AuditLog record
   */
  async logAction(
    action: string,
    entityType: string,
    entityId: number,
    message: string,
    createdBy: string,
  ): Promise<AuditLogResponse> {
    const auditLog = await this.prismaService.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        message,
        createdBy,
      },
    });

    return new AuditLogResponse(auditLog);
  }

  /**
   * Shortcut for system-generated logs (e.g., internal processes, scheduled jobs).
   */
  async logSystemAction(
    action: string,
    entityType: string,
    entityId: number,
    message: string,
  ): Promise<AuditLogResponse> {
    return this.logAction(action, entityType, entityId, message, 'SYSTEM');
  }

  /**
   * Retrieve paginated and optionally filtered audit logs.
   */
  async getAuditLogs(
    entityType?: string,
    action?: string,
    page = 1,
    pageSize = 10,
  ): Promise<{
    data: AuditLogResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (page - 1) * pageSize;

    // Dynamic filtering
    const where: Record<string, any> = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const [data, total] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.auditLog.count({ where }),
    ]);

    return {
      data: data.map((log) => new AuditLogResponse(log)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Find a single audit log by ID.
   */
  async getAuditLogById(id: number): Promise<AuditLogResponse> {
    const auditLog = await this.prismaService.auditLog.findUnique({
      where: { id },
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log not found with id: ${id}`);
    }

    return new AuditLogResponse(auditLog);
  }
}
