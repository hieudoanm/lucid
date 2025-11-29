package io.github.hieudoanm.micro.core.banking.transaction.controller;

import io.github.hieudoanm.micro.core.banking.transaction.dto.*;
import io.github.hieudoanm.micro.core.banking.transaction.entity.Transaction;
import io.github.hieudoanm.micro.core.banking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

  private final TransactionService transactionService;

  /** Deposit funds into an account */
  @PostMapping("/deposit")
  public ResponseEntity<TransactionResponse> deposit(@Valid @RequestBody DepositRequest request) {
    Transaction transaction =
        transactionService.deposit(
            request.getAccountNumber(), request.getAmount(), request.getDescription());

    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
  }

  /** Withdraw funds from an account */
  @PostMapping("/withdraw")
  public ResponseEntity<TransactionResponse> withdraw(@Valid @RequestBody WithdrawRequest request) {
    Transaction transaction =
        transactionService.withdraw(
            request.getAccountNumber(), request.getAmount(), request.getDescription());

    return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
  }

  /** Transfer funds between two accounts */
  @PostMapping("/transfer")
  public ResponseEntity<String> transfer(@Valid @RequestBody TransferRequest request) {
    transactionService.transfer(
        request.getFromAccountNumber(), request.getToAccountNumber(), request.getAmount());

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            "Successfully transferred "
                + request.getAmount()
                + " from "
                + request.getFromAccountNumber()
                + " to "
                + request.getToAccountNumber());
  }

  /** Helper method to map Transaction entity to DTO */
  private TransactionResponse toResponse(Transaction transaction) {
    return TransactionResponse.builder()
        .transactionId(transaction.getId())
        .accountNumber(transaction.getAccount().getAccountNumber())
        .transactionType(transaction.getTransactionType())
        .amount(transaction.getAmount())
        .description(transaction.getDescription())
        .createdAt(transaction.getCreatedAt())
        .build();
  }
}
