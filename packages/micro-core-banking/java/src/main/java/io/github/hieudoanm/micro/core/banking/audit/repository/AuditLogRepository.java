package io.github.hieudoanm.micro.core.banking.audit.repository;

import io.github.hieudoanm.micro.core.banking.audit.entity.AuditLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

  // Find all logs for a specific entity
  List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

  // Find all logs by action type
  List<AuditLog> findByAction(String action);

  // Find logs in a date range
  List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

  Page<AuditLog> findByEntityType(String entityType, Pageable pageable);

  Page<AuditLog> findByAction(String action, Pageable pageable);

  Page<AuditLog> findByEntityTypeAndAction(String entityType, String action, Pageable pageable);
}
