import { IncomingMessage, ServerResponse } from 'node:http';
import { evaluate } from '../../../../../services/stockfish/stockfish.service';
import { logger } from '../../../../../utils/log';
import { getRequestBody } from '../../../../../utils/server';
import { tryCatch } from '../../../../../utils/try-catch';

export const postRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	const { data = {} } = await tryCatch(getRequestBody(request));
	logger.info(data, 'request.data');
	const {
		depth = 15,
		fen = '',
		multiPv = 1,
	} = data as { depth: number; fen: string; multiPv: number };
	const { data: evaluateData, error } = await tryCatch(
		evaluate({ depth, fen, multiPv }),
	);
	if (error || !evaluateData) {
		logger.error(error, 'error');
		response.writeHead(500, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ error, data: null }));
		return;
	}
	const { pvs = [] } = evaluateData;
	logger.info(pvs, 'response.data');
	response.writeHead(200, { 'Content-Type': 'application/json' });
	response.end(JSON.stringify({ error: null, data: { fen, depth, pvs } }));
};
