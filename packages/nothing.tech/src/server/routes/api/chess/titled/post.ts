import { IncomingMessage, ServerResponse } from 'node:http';
import { producePlayerMessage } from '../../../../../services/kafka/kafka.service';
import { logger } from '../../../../../utils/log';
import { tryCatch } from '../../../../../utils/try-catch';

export const postRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	const { url = '' } = request;
	const [path, queryString] = url.split('?');
	const query = new URLSearchParams(queryString);
	logger.info({ url, path, query });
	const titleMap = query.get('titleMap')?.toLowerCase() ?? 'all';
	const title = query.get('title')?.toUpperCase() ?? '';
	const { data } = await tryCatch(producePlayerMessage({ title, titleMap }));
	const { usernames } = data ?? { usernames: new Set() };

	response.writeHead(200, { 'Content-Type': 'application/json' });
	response.end(
		JSON.stringify({
			total: Array.from(usernames).length,
			usernames: Array.from(usernames),
		}),
	);
};
