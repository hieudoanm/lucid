import { IncomingMessage, ServerResponse } from 'node:http';
import { read } from '../../../../../services/easy-ocr/easy-ocr.service';
import { logger } from '../../../../../utils/log';
import { tryCatch } from '../../../../../utils/try-catch';
import { createWriteStream } from 'node:fs';
import path from 'node:path';

const CWD = process.cwd();

export const postRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	try {
		logger.info(request, 'request');

		const filePath: string = path.join(CWD, 'uploads', 'image.png');
		logger.info(`filePath=${filePath}`);
		const writeStream = createWriteStream(filePath);
		request.pipe(writeStream);

		writeStream.on('finish', async () => {
			const imagePath: string = path.join(CWD, 'uploads', 'image.png');
			const { data: result, error } = await tryCatch(read(imagePath));
			if (error) {
				logger.error(error, 'error');
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ error, data: null }));
				return;
			}
			logger.info(result, 'response.data');
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ error: null, data: result }));
		});

		writeStream.on('error', (error) => {
			response.end(JSON.stringify({ error: error.message, data: null }));
		});
	} catch (error) {
		response.end(
			JSON.stringify({ error: (error as Error).message, data: null }),
		);
	}
};
