import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: '1',
    description: 'ID of the main account involved in the transaction',
  })
  @IsString({ message: 'accountId must be a string' })
  accountId: string;

  @ApiProperty({
    example: '2',
    description:
      'ID of the related account (required for transfer transactions)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'relatedAccountId must be a string' })
  relatedAccountId?: string;

  @ApiProperty({ example: 100.0, description: 'Transaction amount' })
  @IsNumber({}, { message: 'amount must be a number' })
  amount: number;

  @ApiProperty({
    example: 'USD',
    description: 'Currency code (e.g., USD, EUR)',
  })
  @IsString({ message: 'currency must be a string' })
  currency: string;

  @ApiProperty({
    enum: TransactionType,
    description: 'Type of transaction (DEPOSIT, WITHDRAWAL, TRANSFER)',
    example: TransactionType.TRANSFER,
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiPropertyOptional({
    example: 'Deposit to savings account',
    description: 'Additional details about the transaction',
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;
}
