import { IncomingMessage, ServerResponse } from 'node:http';
import { prismaClient } from '../../../../../clients/prisma.client';
import { logger } from '../../../../../utils/log';

export const getRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	const { url = '' } = request;
	const [path, queryString] = url.split('?');
	const query = new URLSearchParams(queryString);
	logger.info({ url, path, query });
	const title: string = query.get('title') ?? '';
	const players = await prismaClient.player.findMany({
		select: {
			title: true,
			username: true,
			chessRapidRatingBest: true,
			chessRapidRatingDeviation: true,
			chessBlitzRatingBest: true,
			chessBlitzRatingDeviation: true,
			chessBulletRatingBest: true,
			chessBulletRatingDeviation: true,
			lastOnline: true,
		},
		where: {
			id: { gt: 0 },
			title: title === '' ? undefined : title,
			lastOnline: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) },
			chessRapidRatingDeviation: { gt: 0, lte: 50 },
			chessBlitzRatingDeviation: { gt: 0, lte: 50 },
			chessBulletRatingDeviation: { gt: 0, lte: 50 },
		},
		orderBy: [
			{ chessRapidRatingBest: 'desc' },
			{ chessBlitzRatingBest: 'desc' },
			{ chessBulletRatingBest: 'desc' },
			{ username: 'asc' },
		],
	});

	response.writeHead(200, { 'Content-Type': 'application/json' });
	response.end(
		JSON.stringify({
			total: players.length,
			players: players,
		}),
	);
};
