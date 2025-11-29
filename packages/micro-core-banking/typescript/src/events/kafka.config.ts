export const kafkaConfig = {
  clientId: 'micro-core-banking',
  brokers: ['localhost:9092'], // Replace with your Kafka broker(s)
  groupId: 'micro-core-banking-group',
  schemaRegistryUrl: 'http://schema-registry:8081',
};
