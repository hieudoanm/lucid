package io.github.hieudoanm.micro.core.banking.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.hieudoanm.micro.core.banking.avro.AuditLogEvent;
import io.github.hieudoanm.micro.core.banking.avro.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @KafkaListener(topics = "transaction-events", groupId = "micro-core-banking")
  public void listenTransactionEvents(String message) {
    try {
      TransactionEvent event = objectMapper.readValue(message, TransactionEvent.class);
      log.info("Consumed transaction event: {}", event);
    } catch (Exception e) {
      log.error("Failed to process transaction event: {}", message, e);
    }
  }

  @KafkaListener(topics = "audit-log-events", groupId = "micro-core-banking")
  public void listenAuditLogEvents(String message) {
    try {
      AuditLogEvent event = objectMapper.readValue(message, AuditLogEvent.class);
      log.info("Consumed audit log event: {}", event);
    } catch (Exception e) {
      log.error("Failed to process audit log event: {}", message, e);
    }
  }
}
