import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service'; // custom Prisma wrapper
import { CreateAccountDto, UpdateAccountDto } from './account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new account
   */
  async createAccount(createAccountDto: CreateAccountDto) {
    const accountNumber = this.generateAccountNumber();

    return this.prisma.account.create({
      data: {
        customerId: createAccountDto.customerId,
        accountNumber,
        accountType: createAccountDto.accountType,
        currency: createAccountDto.currency,
        balance: createAccountDto.initialBalance,
        status: 'ACTIVE', // enum from DB
      },
    });
  }

  /**
   * Get all accounts
   */
  async getAllAccounts() {
    return this.prisma.account.findMany();
  }

  /**
   * Get account by account number
   */
  async getAccountByNumber(accountNumber: string) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }
    return account;
  }

  /**
   * Update an existing account
   */
  async updateAccount(
    accountNumber: string,
    updateAccountDto: UpdateAccountDto,
  ) {
    const existingAccount = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!existingAccount) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }

    return this.prisma.account.update({
      where: { accountNumber },
      data: {
        ...updateAccountDto,
      },
    });
  }

  /**
   * Delete an account by account number
   */
  async deleteAccount(accountNumber: string) {
    const existingAccount = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!existingAccount) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }

    await this.prisma.account.delete({
      where: { accountNumber },
    });

    return { message: `Account ${accountNumber} deleted successfully` };
  }

  /**
   * Helper: Generate a unique account number
   */
  private generateAccountNumber(): string {
    return `ACCT-${Date.now()}`;
  }
}
