import { Injectable, Logger } from '@nestjs/common';
import { CreateTransactionDto } from '../../modules/transaction/transaction.dto';
import { TransactionService } from '../../modules/transaction/transaction.service';
import { KafkaService } from '../kafka.service';

@Injectable()
export class TransactionConsumerService {
  private readonly logger = new Logger(TransactionConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Initialize the consumer and subscribe to the "transactions" topic
   */
  async onModuleInit() {
    await this.kafkaService.consume(
      'transactions',
      async (data: CreateTransactionDto) => {
        try {
          this.logger.log(
            `Received transaction message: ${JSON.stringify(data)}`,
          );

          const dto: CreateTransactionDto = {
            accountId: data.accountId.toString(),
            transactionType: data.transactionType,
            amount: data.amount,
            currency: data.currency,
            description: `Kafka event received at ${new Date().toISOString()}`,
          };

          await this.transactionService.createTransaction(dto);

          this.logger.log(
            `Transaction successfully processed for account ${data.accountId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process transaction message: ${(error as Error).message}`,
          );
        }
      },
    );
  }
}
