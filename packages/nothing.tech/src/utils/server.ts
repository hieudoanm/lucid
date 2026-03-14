import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { logger } from './log';

export const CONTENT_TYPE_APPLICATION_JSON = 'application/json';

export const enableCors = (
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	// Set CORS headers
	response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
	response.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS',
	);
	response.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	);
};

export const getRequestBody = async (request: IncomingMessage) => {
	return new Promise((resolve) => {
		let body = '';
		const contentType = request.headers['content-type'] ?? '';

		request.on('data', (chunk) => {
			body += chunk.toString();
		});

		request.on('end', async () => {
			let data = {};
			if (contentType?.includes('application/json')) {
				data = JSON.parse(body); // Parse JSON
			} else if (contentType.includes('application/x-www-form-urlencoded')) {
				const params = new URLSearchParams(body);
				data = Object.fromEntries(params.entries());
			}
			logger.info(data, 'Received Request Body');
			resolve(data);
		});
	});
};

export const getContentType = (filePath: string) => {
	const ext = path.extname(filePath);
	switch (ext) {
		case '.html':
			return 'text/html';
		case '.css':
			return 'text/css';
		case '.js':
			return 'text/javascript';
		case '.ico':
			return 'image/x-icon';
		case '.svg':
			return 'image/svg+xml';
		case '.json':
			return CONTENT_TYPE_APPLICATION_JSON;
		default:
			return 'text/plain';
	}
};
