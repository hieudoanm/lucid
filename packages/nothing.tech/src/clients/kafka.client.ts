import { Kafka, logLevel } from 'kafkajs';
import { logger } from '../utils/log';

export const kafka = new Kafka({
	logCreator: () => {
		return ({ level, log }) => {
			const { message } = log;
			if (level === logLevel.ERROR) {
				logger.error(message);
			} else if (level === logLevel.DEBUG) {
				logger.debug(message);
			} else if (level === logLevel.INFO) {
				logger.info(message);
			} else if (level === logLevel.WARN) {
				logger.warn(message);
			}
		};
	},
	clientId: 'chess.com-consumer',
	brokers: ['127.0.0.1:9092'], // Use 'kafka:9092' if inside Docker
});

export const consumer = kafka.consumer({ groupId: 'chess-group' });

export const producer = kafka.producer();
