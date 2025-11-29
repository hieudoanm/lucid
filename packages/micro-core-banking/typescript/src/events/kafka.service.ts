// src/kafka/kafka.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka = new Kafka({
    clientId: 'micro-core-banking',
    brokers: ['localhost:9092'], // For NestJS running outside Docker
  });

  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    this.logger.log('Connecting to Kafka...');
    this.producer = this.kafka.producer();
    await this.producer.connect();
    this.logger.log('Kafka Producer connected');

    this.consumer = this.kafka.consumer({
      groupId: 'micro-core-banking-group',
    });
    await this.consumer.connect();
    this.logger.log('Kafka Consumer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  /**
   * Produce raw JSON message
   */
  async produce(topic: string, data: any) {
    const payload = {
      value: JSON.stringify(data),
    };

    this.logger.log(
      `Sending message to topic "${topic}": ${JSON.stringify(data)}`,
    );

    await this.producer.send({
      topic,
      messages: [payload],
    });
  }

  /**
   * Subscribe to a topic and process messages
   */
  async consume(topic: string, callback: (message: any) => Promise<void>) {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const rawValue = message.value?.toString() ?? '{}';
        this.logger.log(
          `Received message from topic "${topic} ${partition}": ${rawValue}`,
        );

        try {
          const data = JSON.parse(rawValue);
          await callback(data);
        } catch (err) {
          this.logger.error('Error processing message', err);
        }
      },
    });
  }
}
