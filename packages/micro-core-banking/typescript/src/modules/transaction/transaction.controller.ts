import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto } from './transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transactions') // Group under "Transactions" in Swagger UI
@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Create a new transaction
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient funds',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionService.createTransaction(dto);
  }

  /**
   * Get all transactions for a specific account
   */
  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all transactions for a specific account' })
  @ApiParam({
    name: 'accountId',
    type: String,
    description: 'The ID of the account',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for the account',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getTransactionsByAccount(@Param('accountId') accountId: string) {
    return this.transactionService.getTransactionsByAccount(accountId);
  }

  /**
   * Get a single transaction by its reference
   */
  @Get(':transactionRef')
  @ApiOperation({ summary: 'Get a single transaction by its reference ID' })
  @ApiParam({
    name: 'transactionRef',
    type: String,
    description: 'The reference ID of the transaction',
  })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionByRef(@Param('transactionRef') transactionRef: string) {
    return this.transactionService.getTransactionByRef(transactionRef);
  }
}
