package io.github.hieudoanm.micro.core.banking.account.service;

import io.github.hieudoanm.micro.core.banking.account.entity.Account;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountStatus;
import io.github.hieudoanm.micro.core.banking.account.repository.AccountRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountService {

  private final AccountRepository accountRepository;

  public Account createAccount(Account account) {
    return accountRepository.save(account);
  }

  public Optional<Account> getAccountByNumber(String accountNumber) {
    return accountRepository.findByAccountNumber(accountNumber);
  }

  public List<Account> getActiveAccountsForCustomer(String customerId) {
    return accountRepository.findByCustomerIdAndStatus(customerId, AccountStatus.ACTIVE);
  }

  public Account updateAccount(Account account) {
    return accountRepository.save(account);
  }

  public void deleteAccount(Long accountId) {
    accountRepository.deleteById(accountId);
  }
}
