package io.github.hieudoanm.micro.core.banking.transaction.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class DepositRequest {

  @NotBlank(message = "Account number is required.")
  private String accountNumber;

  @NotNull(message = "Amount is required.")
  @DecimalMin(value = "0.01", message = "Deposit amount must be greater than 0.")
  private BigDecimal amount;

  @Size(max = 255, message = "Description cannot exceed 255 characters.")
  private String description;
}
