package io.github.hieudoanm.micro.core.banking.audit.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogResponse {
  private Long id;
  private String action; // e.g., DEPOSIT, WITHDRAWAL, TRANSFER
  private String entityType; // e.g., Account, Transaction
  private Long entityId;
  private String message; // Detailed message about what happened
  private String createdBy; // User or system that performed the action
  private LocalDateTime createdAt;
}
