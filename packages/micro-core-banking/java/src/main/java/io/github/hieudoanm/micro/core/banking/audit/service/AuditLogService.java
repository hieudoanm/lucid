package io.github.hieudoanm.micro.core.banking.audit.service;

import io.github.hieudoanm.micro.core.banking.audit.entity.AuditLog;
import io.github.hieudoanm.micro.core.banking.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

  private final AuditLogRepository auditLogRepository;

  /**
   * Create a simple audit log entry.
   *
   * @param action The action performed (e.g., CREATE, UPDATE, DELETE, TRANSFER)
   * @param entityType The type of entity (e.g., Account, Transaction)
   * @param entityId The unique identifier of the entity
   * @param message Additional details or description
   * @param createdBy User or system that performed the action
   * @return The saved AuditLog entity
   */
  public AuditLog logAction(
      String action, String entityType, Long entityId, String message, String createdBy) {

    AuditLog auditLog =
        AuditLog.builder()
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .message(message)
            .createdBy(createdBy)
            .build();

    return auditLogRepository.save(auditLog);
  }

  /** Shortcut for system-generated logs (e.g., internal processes, scheduled jobs) */
  public AuditLog logSystemAction(String action, String entityType, Long entityId, String message) {
    return logAction(action, entityType, entityId, message, "SYSTEM");
  }

  /** Retrieve paginated and optionally filtered audit logs. */
  public Page<AuditLog> getAuditLogs(String entityType, String action, Pageable pageable) {
    if (entityType != null && action != null) {
      return auditLogRepository.findByEntityTypeAndAction(entityType, action, pageable);
    } else if (entityType != null) {
      return auditLogRepository.findByEntityType(entityType, pageable);
    } else if (action != null) {
      return auditLogRepository.findByAction(action, pageable);
    } else {
      return auditLogRepository.findAll(pageable);
    }
  }

  /** Find a single audit log by ID. */
  public AuditLog getAuditLogById(Long id) {
    return auditLogRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Audit log not found with id: " + id));
  }
}
