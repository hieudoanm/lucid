package io.github.hieudoanm.micro.core.banking.account.entity;

import io.github.hieudoanm.micro.core.banking.account.enums.AccountStatus;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountType;
import io.github.hieudoanm.micro.core.banking.transaction.entity.Transaction;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "accounts", schema = "micro_core_banking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "account_number", nullable = false, unique = true, length = 20)
  private String accountNumber;

  @Column(name = "customer_id", nullable = false, length = 36)
  private String customerId;

  @Enumerated(EnumType.STRING)
  @Column(name = "account_type", nullable = false, length = 20)
  private AccountType accountType;

  @Column(nullable = false, precision = 15, scale = 2)
  private BigDecimal balance;

  @Column(nullable = false, length = 3)
  private String currency;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AccountStatus status;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  /** Relationships */
  @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Transaction> transactions;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    createdAt = now;
    updatedAt = now;
    if (balance == null) balance = BigDecimal.ZERO;
    if (status == null) status = AccountStatus.ACTIVE;
  }

  @PreUpdate
  public void preUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
