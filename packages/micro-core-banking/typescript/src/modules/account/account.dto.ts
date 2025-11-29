import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
  CREDIT = 'CREDIT',
}

export class CreateAccountDto {
  @ApiProperty({
    description: 'ID of the customer who owns this account',
    example: 'cust-12345',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Initial balance for the account',
    example: 1000.0,
  })
  @IsNumber()
  initialBalance: number;

  @ApiProperty({
    description: 'Currency code for the account',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Type of account',
    enum: AccountType,
    example: AccountType.SAVINGS,
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
