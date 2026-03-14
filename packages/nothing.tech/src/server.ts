import { consumer, producer } from './clients/kafka.client';
import { startHttpServer } from './server/http';
import { startKafkaServer } from './server/kafka';
import { logger } from './utils/log';

const startServer = async () => {
	await startHttpServer();
	await startKafkaServer();
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
	logger.info('🔄 Shutting down Server ...');
	await producer.disconnect();
	await consumer.disconnect();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('🔄 Shutting down Server ...');
	await producer.disconnect();
	await consumer.disconnect();
	process.exit(0);
});

startServer();
