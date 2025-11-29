import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogResponse } from './audit.dto';
import { AuditService } from './audit.service';

@ApiTags('Audit Logs') // Group under Swagger section
@Controller('api/audit/logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Get a paginated list of audit logs with optional filtering by entity type and action.
   *
   * Example:
   * GET /api/audit/logs?page=1&size=10&entityType=Account&action=CREATE
   */
  @Get()
  @ApiOperation({ summary: 'Get paginated audit logs with optional filters' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    required: false,
    description: 'Number of records per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'entityType',
    type: String,
    required: false,
    description: 'Filter by entity type (e.g., Account, Transaction)',
    example: 'Account',
  })
  @ApiQuery({
    name: 'action',
    type: String,
    required: false,
    description: 'Filter by action (e.g., CREATE, UPDATE, DELETE)',
    example: 'CREATE',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved paginated audit logs',
    schema: {
      example: {
        data: [
          {
            id: 1,
            action: 'CREATE',
            entityType: 'Account',
            entityId: 101,
            message: 'Created new account with ID 101',
            createdBy: 'admin',
            createdAt: '2025-09-23T10:00:00Z',
            updatedAt: '2025-09-23T10:00:00Z',
          },
        ],
        total: 100,
        page: 1,
        pageSize: 10,
      },
    },
  })
  async getAuditLogs(
    @Query('page', ParseIntPipe) page = 1,
    @Query('size', ParseIntPipe) size = 10,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ): Promise<{
    data: AuditLogResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.auditService.getAuditLogs(entityType, action, page, size);
  }

  /**
   * Get a specific audit log by ID.
   *
   * Example:
   * GET /api/audit/logs/123
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique ID of the audit log',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    type: AuditLogResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async getAuditLogById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuditLogResponse> {
    return this.auditService.getAuditLogById(id);
  }
}
