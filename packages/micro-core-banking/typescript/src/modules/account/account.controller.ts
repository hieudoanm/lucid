import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountDto, UpdateAccountDto } from './account.dto';
import { AccountService } from './account.service';

@ApiTags('Accounts') // Groups all endpoints under "Accounts" in Swagger UI
@Controller('api/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Create a new account
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.createAccount(createAccountDto);
  }

  /**
   * Get all accounts
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all accounts.',
  })
  async getAllAccounts() {
    return this.accountService.getAllAccounts();
  }

  /**
   * Get account by account number
   */
  @Get(':accountNumber')
  @ApiOperation({ summary: 'Get an account by account number' })
  @ApiParam({
    name: 'accountNumber',
    type: String,
    description: 'The unique account number to retrieve',
    example: 'ACCT-1695453892990',
  })
  @ApiResponse({
    status: 200,
    description: 'Account details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  async getAccountByNumber(@Param('accountNumber') accountNumber: string) {
    return this.accountService.getAccountByNumber(accountNumber);
  }

  /**
   * Update an existing account by account number
   */
  @Put(':accountNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an account by account number' })
  @ApiParam({
    name: 'accountNumber',
    type: String,
    description: 'The unique account number to update',
    example: 'ACCT-1695453892990',
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  async updateAccount(
    @Param('accountNumber') accountNumber: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(accountNumber, updateAccountDto);
  }

  /**
   * Delete an account by account number
   */
  @Delete(':accountNumber')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account by account number' })
  @ApiParam({
    name: 'accountNumber',
    type: String,
    description: 'The unique account number to delete',
    example: 'ACCT-1695453892990',
  })
  @ApiResponse({
    status: 204,
    description: 'Account deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found.',
  })
  async deleteAccount(@Param('accountNumber') accountNumber: string) {
    return this.accountService.deleteAccount(accountNumber);
  }
}
