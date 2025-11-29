import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { KafkaModule } from './events/kafka.module';
import { AccountModule } from './modules/account/account.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    HealthModule,
    AuditModule,
    AccountModule,
    TransactionModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
