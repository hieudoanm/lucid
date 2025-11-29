package io.github.hieudoanm.micro.core.banking.transaction.service;

import io.github.hieudoanm.micro.core.banking.account.entity.Account;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountStatus;
import io.github.hieudoanm.micro.core.banking.account.repository.AccountRepository;
import io.github.hieudoanm.micro.core.banking.avro.AuditLogEvent;
import io.github.hieudoanm.micro.core.banking.avro.TransactionEvent;
import io.github.hieudoanm.micro.core.banking.avro.TransactionType;
import io.github.hieudoanm.micro.core.banking.kafka.producer.KafkaProducerService;
import io.github.hieudoanm.micro.core.banking.transaction.dto.CreateTransactionRequest;
import io.github.hieudoanm.micro.core.banking.transaction.entity.Transaction;
import io.github.hieudoanm.micro.core.banking.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

  private final AccountRepository accountRepository;
  private final TransactionRepository transactionRepository;
  private final KafkaProducerService kafkaProducerService;

  private static final String SYSTEM_USER = "SYSTEM";

  /** Handle deposit request */
  @Transactional
  public Transaction deposit(String accountNumber, BigDecimal amount, String description) {
    Account account = getValidAccount(accountNumber);

    validateAmount(amount);

    account.setBalance(account.getBalance().add(amount));
    accountRepository.save(account);

    Transaction transaction =
        buildTransaction(account, TransactionType.DEPOSIT, amount, description);
    transactionRepository.save(transaction);

    publishTransactionAndAuditEvents(
        transaction, "Deposited " + amount + " into account " + accountNumber);

    return transaction;
  }

  /** Handle withdrawal request */
  @Transactional
  public Transaction withdraw(String accountNumber, BigDecimal amount, String description) {
    Account account = getValidAccount(accountNumber);

    validateAmount(amount);

    if (account.getBalance().compareTo(amount) < 0) {
      throw new IllegalArgumentException("Insufficient balance for withdrawal.");
    }

    account.setBalance(account.getBalance().subtract(amount));
    accountRepository.save(account);

    Transaction transaction =
        buildTransaction(account, TransactionType.WITHDRAWAL, amount, description);
    transactionRepository.save(transaction);

    publishTransactionAndAuditEvents(
        transaction, "Withdrew " + amount + " from account " + accountNumber);

    return transaction;
  }

  /** Transfer funds between two accounts */
  @Transactional
  public void transfer(String fromAccountNumber, String toAccountNumber, BigDecimal amount) {
    if (fromAccountNumber.equals(toAccountNumber)) {
      throw new IllegalArgumentException("Cannot transfer to the same account.");
    }

    validateAmount(amount);

    Account fromAccount = getValidAccount(fromAccountNumber);
    Account toAccount = getValidAccount(toAccountNumber);

    if (fromAccount.getBalance().compareTo(amount) < 0) {
      throw new IllegalArgumentException("Insufficient balance for transfer.");
    }

    // Debit from source
    fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
    accountRepository.save(fromAccount);

    Transaction debitTransaction =
        buildTransaction(
            fromAccount, TransactionType.TRANSFER, amount, "Transfer to " + toAccountNumber);
    transactionRepository.save(debitTransaction);

    // Credit to target
    toAccount.setBalance(toAccount.getBalance().add(amount));
    accountRepository.save(toAccount);

    Transaction creditTransaction =
        buildTransaction(
            toAccount, TransactionType.TRANSFER, amount, "Transfer from " + fromAccountNumber);
    transactionRepository.save(creditTransaction);

    // Publish Kafka events
    publishTransactionAndAuditEvents(
        debitTransaction,
        "Transferred " + amount + " from " + fromAccountNumber + " to " + toAccountNumber);

    publishTransactionAndAuditEvents(
        creditTransaction,
        "Received " + amount + " from " + fromAccountNumber + " to " + toAccountNumber);
  }

  /** Single entry point for transaction creation based on request */
  @Transactional
  public Transaction createTransaction(CreateTransactionRequest request) {
    TransactionType type = request.getTransactionType();
    validateTransactionType(type);
    validateAmount(request.getAmount());

    Account fromAccount = getValidAccount(request.getFromAccountNumber());
    Account toAccount = null;

    // If transfer, validate destination account
    if (type.equals("TRANSFER")) {
      if (request.getToAccountNumber() == null || request.getToAccountNumber().isBlank()) {
        throw new IllegalArgumentException("Destination account number is required for transfer.");
      }

      if (request.getFromAccountNumber().equals(request.getToAccountNumber())) {
        throw new IllegalArgumentException("Cannot transfer to the same account.");
      }

      toAccount = getValidAccount(request.getToAccountNumber());
    }

    // Execute business logic
    executeTransactionLogic(type, fromAccount, toAccount, request.getAmount());

    // Create single transaction record
    Transaction transaction =
        buildTransaction(fromAccount, type, request.getAmount(), request.getDescription());
    transactionRepository.save(transaction);

    // Publish Kafka events
    String auditMessage = buildAuditMessage(type, fromAccount, toAccount, request.getAmount());
    publishTransactionAndAuditEvents(transaction, auditMessage);

    return transaction;
  }

  /** Core logic for updating balances based on transaction type */
  private void executeTransactionLogic(
      TransactionType type, Account fromAccount, Account toAccount, BigDecimal amount) {
    switch (type) {
      case TransactionType.DEPOSIT -> {
        fromAccount.setBalance(fromAccount.getBalance().add(amount));
        accountRepository.save(fromAccount);
      }
      case TransactionType.WITHDRAWAL -> {
        if (fromAccount.getBalance().compareTo(amount) < 0) {
          throw new IllegalArgumentException("Insufficient balance for withdrawal.");
        }
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        accountRepository.save(fromAccount);
      }
      case TransactionType.TRANSFER -> {
        if (fromAccount.getBalance().compareTo(amount) < 0) {
          throw new IllegalArgumentException("Insufficient balance for transfer.");
        }
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
      }
    }
  }

  /** Validate that amount is greater than zero */
  private void validateAmount(BigDecimal amount) {
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Amount must be greater than zero.");
    }
  }

  /** Ensure transaction type is valid */
  private void validateTransactionType(TransactionType type) {
    if (!type.equals(TransactionType.DEPOSIT)
        && !type.equals(TransactionType.WITHDRAWAL)
        && !type.equals(TransactionType.TRANSFER)) {
      throw new IllegalArgumentException("Invalid transaction type: " + type);
    }
  }

  /** Helper method to validate and retrieve an active account */
  private Account getValidAccount(String accountNumber) {
    return accountRepository
        .findByAccountNumber(accountNumber)
        .filter(acc -> acc.getStatus() == AccountStatus.ACTIVE)
        .orElseThrow(() -> new IllegalArgumentException("Account not found or inactive."));
  }

  /** Build a new Transaction entity */
  private Transaction buildTransaction(
      Account account, TransactionType type, BigDecimal amount, String description) {
    return Transaction.builder()
        .account(account)
        .transactionType(type)
        .amount(amount)
        .description(description)
        .createdAt(LocalDateTime.now())
        .build();
  }

  /** Build an audit message string */
  private String buildAuditMessage(
      TransactionType type, Account fromAccount, Account toAccount, BigDecimal amount) {
    return switch (type) {
      case TransactionType.DEPOSIT ->
          "Deposited " + amount + " into account " + fromAccount.getAccountNumber();
      case TransactionType.WITHDRAWAL ->
          "Withdrew " + amount + " from account " + fromAccount.getAccountNumber();
      case TransactionType.TRANSFER ->
          "Transferred "
              + amount
              + " from "
              + fromAccount.getAccountNumber()
              + " to "
              + toAccount.getAccountNumber();
      default -> "Unknown transaction action";
    };
  }

  /** Publish both transaction and audit log events to Kafka */
  private void publishTransactionAndAuditEvents(Transaction transaction, String auditMessage) {
    Instant now = Instant.now();

    // Transaction event
    kafkaProducerService.sendTransactionEvent(
        TransactionEvent.newBuilder()
            .setTransactionId(transaction.getId().toString())
            .setAccountNumber(transaction.getAccount().getAccountNumber())
            .setType(transaction.getTransactionType())
            .setAmount(transaction.getAmount())
            .setCurrency(transaction.getAccount().getCurrency())
            .setTimestamp(now)
            .build());

    // Audit log event
    kafkaProducerService.sendAuditLogEvent(
        AuditLogEvent.newBuilder()
            .setAction(transaction.getTransactionType().toString())
            .setEntityType("Transaction")
            .setEntityId(transaction.getId())
            .setMessage(auditMessage)
            .setCreatedBy(SYSTEM_USER)
            .setCreatedAt(now)
            .build());
  }
}
