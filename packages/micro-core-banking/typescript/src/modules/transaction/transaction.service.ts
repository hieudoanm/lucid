import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Account, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma.service';
import { KafkaService } from '../../events/kafka.service';
import { CreateTransactionDto } from './transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Create a transaction and update balances atomically
   */
  async createTransaction(dto: CreateTransactionDto) {
    const amount = new Decimal(dto.amount);

    if (amount.lte(0)) {
      throw new BadRequestException(
        'Transaction amount must be greater than 0',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Fetch main account
      const account = await tx.account.findUnique({
        where: { id: parseInt(dto.accountId) },
      });

      if (!account) {
        throw new NotFoundException(
          `Account with ID ${dto.accountId} not found`,
        );
      }

      // Validate and handle TRANSFER
      let relatedAccount: Account | null = null;
      if (dto.transactionType === TransactionType.TRANSFER) {
        if (!dto.relatedAccountId) {
          throw new BadRequestException(
            'Related account ID is required for transfers',
          );
        }

        relatedAccount = await tx.account.findUnique({
          where: { id: parseInt(dto.relatedAccountId) },
        });

        if (!relatedAccount) {
          throw new NotFoundException(
            `Related account with ID ${dto.relatedAccountId} not found`,
          );
        }

        if (account.id === relatedAccount.id) {
          throw new BadRequestException('Cannot transfer to the same account');
        }
      }

      // Validate sufficient funds for withdrawal or transfer
      if (
        (dto.transactionType === TransactionType.WITHDRAWAL ||
          dto.transactionType === TransactionType.TRANSFER) &&
        account.balance.lt(amount)
      ) {
        throw new BadRequestException('Insufficient funds');
      }

      // Update balances based on transaction type
      switch (dto.transactionType) {
        case TransactionType.DEPOSIT:
          await tx.account.update({
            where: { id: account.id },
            data: { balance: account.balance.plus(amount) },
          });
          break;

        case TransactionType.WITHDRAWAL:
          await tx.account.update({
            where: { id: account.id },
            data: { balance: account.balance.minus(amount) },
          });
          break;

        case TransactionType.TRANSFER:
          if (relatedAccount) {
            await tx.account.update({
              where: { id: account.id },
              data: { balance: account.balance.minus(amount) },
            });

            await tx.account.update({
              where: { id: relatedAccount.id },
              data: { balance: relatedAccount.balance.plus(amount) },
            });
          }
          break;

        default:
          throw new BadRequestException(
            `Invalid transaction type: ${dto.transactionType}`,
          );
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionRef: this.generateTransactionRef(),
          accountId: account.id,
          relatedAccountId: relatedAccount ? relatedAccount.id : null,
          transactionType: dto.transactionType,
          amount,
          currency: dto.currency,
          description: dto.description,
        },
      });

      // Publish transaction to Kafka
      try {
        await this.kafkaService.produce('transactions', {
          transactionId: transaction.transactionRef,
          accountId: account.id,
          relatedAccountId: relatedAccount ? relatedAccount.id : null,
          transactionType: dto.transactionType,
          amount: dto.amount,
          currency: dto.currency,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(
          `Published transaction ${transaction.transactionRef} to Kafka`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to publish transaction to Kafka: ${(error as Error).message}`,
        );
        throw new InternalServerErrorException(
          'Failed to publish transaction to Kafka',
        );
      }

      return transaction;
    });
  }

  /**
   * Get all transactions for a specific account.
   */
  async getTransactionsByAccount(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId: parseInt(accountId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single transaction by its reference ID.
   */
  async getTransactionByRef(transactionRef: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionRef },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with reference ${transactionRef} not found`,
      );
    }

    return transaction;
  }

  /**
   * Utility: Generate unique transaction reference
   */
  private generateTransactionRef(): string {
    return `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
