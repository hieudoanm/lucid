package io.github.hieudoanm.micro.core.banking.account.repository;

import io.github.hieudoanm.micro.core.banking.account.entity.Account;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountStatus;
import io.github.hieudoanm.micro.core.banking.account.enums.AccountType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

  // Find by unique account number
  Optional<Account> findByAccountNumber(String accountNumber);

  // Find all accounts by customer ID
  List<Account> findByCustomerId(String customerId);

  // Find accounts by type
  List<Account> findByAccountType(AccountType type);

  // Find accounts by status
  List<Account> findByStatus(AccountStatus status);

  // Find active accounts for a customer
  List<Account> findByCustomerIdAndStatus(String customerId, AccountStatus status);
}
