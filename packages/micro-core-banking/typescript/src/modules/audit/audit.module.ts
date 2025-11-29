import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [],
  controllers: [AuditController],
  providers: [PrismaService, AuditService],
})
export class AuditModule {}
