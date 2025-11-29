package io.github.hieudoanm.micro.core.banking.transaction.dto;

import io.github.hieudoanm.micro.core.banking.avro.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {
  private Long transactionId;
  private String accountNumber;
  private TransactionType
      transactionType; // e.g., DEPOSIT, WITHDRAWAL, TRANSFER_DEBIT, TRANSFER_CREDIT
  private BigDecimal amount;
  private String description;
  private LocalDateTime createdAt;
}
