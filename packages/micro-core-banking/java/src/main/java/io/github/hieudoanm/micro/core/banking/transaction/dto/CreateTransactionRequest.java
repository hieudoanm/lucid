package io.github.hieudoanm.micro.core.banking.transaction.dto;

import io.github.hieudoanm.micro.core.banking.avro.TransactionType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Data;

/** DTO for creating a new transaction (Deposit, Withdrawal, Transfer). */
@Data
public class CreateTransactionRequest {

  /**
   * Source account number (for deposits and withdrawals, this is the account being credited or
   * debited).
   */
  @NotBlank(message = "From account number is required.")
  private String fromAccountNumber;

  /** Destination account number (only required for transfers). */
  private String toAccountNumber;

  /** The type of transaction: - DEPOSIT - WITHDRAWAL - TRANSFER */
  @NotBlank(message = "Transaction type is required.")
  @Pattern(
      regexp = "DEPOSIT|WITHDRAWAL|TRANSFER",
      message = "Transaction type must be DEPOSIT, WITHDRAWAL, or TRANSFER.")
  private TransactionType transactionType;

  /** Transaction amount - must be greater than zero. */
  @NotNull(message = "Amount is required.")
  @DecimalMin(value = "0.01", message = "Amount must be greater than zero.")
  private BigDecimal amount;

  /** Optional description for the transaction. */
  @Size(max = 255, message = "Description cannot exceed 255 characters.")
  private String description;
}
