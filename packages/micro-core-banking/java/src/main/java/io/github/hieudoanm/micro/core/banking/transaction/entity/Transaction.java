package io.github.hieudoanm.micro.core.banking.transaction.entity;

import io.github.hieudoanm.micro.core.banking.account.entity.Account;
import io.github.hieudoanm.micro.core.banking.avro.TransactionType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "transactions", schema = "micro_core_banking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "transaction_ref", nullable = false, unique = true, length = 36)
  private String transactionRef;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "related_account_id")
  private Account relatedAccount;

  @Column(name = "transaction_type", nullable = false, length = 20)
  private TransactionType transactionType;

  @Column(name = "amount", nullable = false, precision = 15, scale = 2)
  private BigDecimal amount;

  @Column(name = "currency", nullable = false, length = 3)
  private String currency;

  @Column(name = "description", length = 255)
  private String description;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
