package io.github.hieudoanm.micro.core.banking.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.hieudoanm.micro.core.banking.avro.AuditLogEvent;
import io.github.hieudoanm.micro.core.banking.avro.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

  private final KafkaTemplate<String, String> kafkaTemplate;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public void sendTransactionEvent(TransactionEvent event) {
    try {
      String message = objectMapper.writeValueAsString(event);
      kafkaTemplate.send("transaction-events", event.getEventId(), message);
      log.info("Published transaction event: {}", message);
    } catch (JsonProcessingException e) {
      log.error("Failed to serialize transaction event", e);
    }
  }

  public void sendAuditLogEvent(AuditLogEvent event) {
    try {
      String message = objectMapper.writeValueAsString(event);
      kafkaTemplate.send("audit-log-events", event.getEventId(), message);
      log.info("Published audit log event: {}", message);
    } catch (JsonProcessingException e) {
      log.error("Failed to serialize audit log event", e);
    }
  }
}
