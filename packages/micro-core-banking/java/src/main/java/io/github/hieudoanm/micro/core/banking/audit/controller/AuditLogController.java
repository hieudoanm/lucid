package io.github.hieudoanm.micro.core.banking.audit.controller;

import io.github.hieudoanm.micro.core.banking.audit.dto.AuditLogResponse;
import io.github.hieudoanm.micro.core.banking.audit.entity.AuditLog;
import io.github.hieudoanm.micro.core.banking.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

  private final AuditLogService auditLogService;

  /** Get a paginated list of audit logs with optional filtering by entity type and action. */
  @GetMapping
  public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String entityType,
      @RequestParam(required = false) String action) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<AuditLog> logs = auditLogService.getAuditLogs(entityType, action, pageable);

    Page<AuditLogResponse> response = logs.map(this::mapToResponse);
    return ResponseEntity.ok(response);
  }

  /** Get a specific audit log by ID. */
  @GetMapping("/{id}")
  public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable Long id) {
    AuditLog log = auditLogService.getAuditLogById(id);
    return ResponseEntity.ok(mapToResponse(log));
  }

  /** Helper to map entity to DTO */
  private AuditLogResponse mapToResponse(AuditLog log) {
    return AuditLogResponse.builder()
        .id(log.getId())
        .action(log.getAction())
        .entityType(log.getEntityType())
        .entityId(log.getEntityId())
        .message(log.getMessage())
        .createdBy(log.getCreatedBy())
        .createdAt(log.getCreatedAt())
        .build();
  }
}
