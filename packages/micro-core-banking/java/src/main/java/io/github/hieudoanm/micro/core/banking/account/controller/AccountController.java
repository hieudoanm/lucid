package io.github.hieudoanm.micro.core.banking.account.controller;

import io.github.hieudoanm.micro.core.banking.account.dto.CreateAccountRequest;
import io.github.hieudoanm.micro.core.banking.account.entity.Account;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountStatus;
import io.github.hieudoanm.micro.core.banking.account.repository.AccountRepository;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

  private final AccountRepository accountRepository;

  @PostMapping
  public ResponseEntity<Account> createAccount(@Valid @RequestBody CreateAccountRequest request) {
    Account account =
        Account.builder()
            .customerId(request.getCustomerId())
            .accountNumber(generateAccountNumber())
            .accountType(request.getAccountType())
            .currency(request.getCurrency())
            .balance(request.getInitialBalance())
            .status(AccountStatus.ACTIVE)
            .build();

    return ResponseEntity.ok(accountRepository.save(account));
  }

  @GetMapping
  public List<Account> getAllAccounts() {
    return accountRepository.findAll();
  }

  @GetMapping("/{accountNumber}")
  public ResponseEntity<Account> getAccountByNumber(@PathVariable String accountNumber) {
    return accountRepository
        .findByAccountNumber(accountNumber)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // Utility to generate unique account number
  private String generateAccountNumber() {
    return "ACCT-" + System.currentTimeMillis();
  }
}
