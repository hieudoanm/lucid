import { readFile } from 'node:fs/promises';
import { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { logger } from '../../../utils/log';
import { getContentType } from '../../../utils/server';
import { tryCatch } from '../../../utils/try-catch';

const PUBLIC_DIR = join(process.cwd(), 'public');

export const getPageRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	const { url = '' } = request;
	const [path] = url.split('?');
	const favicon: string = path.includes('favicon')
		? path
		: `${path}/index.html`;
	const staticFile: string = path === '/' ? 'index.html' : favicon;
	const filePath = join(PUBLIC_DIR, staticFile);
	logger.info(`getPageRoute filePath=${filePath}`);
	const { data, error } = await tryCatch(readFile(filePath));
	if (error) logger.error(`getPageRoute error=${error.message}`);
	response.writeHead(200, { 'Content-Type': getContentType(filePath) });
	response.end(data);
};
