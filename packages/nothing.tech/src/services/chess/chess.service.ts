import { getPlayer, getStats } from '../../clients/chess.client';
import { prismaClient } from '../../clients/prisma.client';
import { logger } from '../../utils/log';
import { tryCatch } from '../../utils/try-catch';

export const addPlayer = async (player: string) => {
	const { data: playerData = {}, error: playerError } = await tryCatch(
		getPlayer(player),
	);
	if (playerError) {
		logger.error(
			`❌ Error fetching player=${player} data error=${playerError.message}`,
		);
		return;
	}
	const {
		avatar = '',
		player_id: id = 0,
		url = '',
		name = '',
		username = '',
		title = '',
		followers = 0,
		country = '',
		location = '',
		last_online: lastOnline = 0,
		joined = 0,
		status = '',
		is_streamer: isStreamer = false,
		twitch_url: twitchUrl = '',
		verified = false,
		league = '',
	} = playerData ?? {};
	// Get Stats
	const { data: statsData = {}, error: statsError } = await tryCatch(
		getStats(player),
	);
	if (statsError) {
		logger.error(
			`❌ Error fetching player=${player} stats error=${statsError.message}`,
		);
		return;
	}
	const {
		chess_rapid: {
			last: {
				rating: chessRapidRatingLast = 0,
				rd: chessRapidRatingDeviation = 0,
			} = { rating: 0, rd: 0 },
			best: { rating: chessRapidRatingBest = 0 } = { rating: 0 },
			record: {
				win: chessRapidRecordWin = 0,
				draw: chessRapidRecordDraw = 0,
				loss: chessRapidRecordLoss = 0,
			} = {
				win: 0,
				loss: 0,
				draw: 0,
			},
		} = {
			last: { rating: 0, rd: 0 },
			best: { rating: 0 },
			record: { win: 0, draw: 0, loss: 0 },
		},
		chess_blitz: {
			last: {
				rating: chessBlitzRatingLast = 0,
				rd: chessBlitzRatingDeviation = 0,
			} = { rating: 0, rd: 0 },
			best: { rating: chessBlitzRatingBest = 0 } = { rating: 0 },
			record: {
				win: chessBlitzRecordWin = 0,
				draw: chessBlitzRecordDraw = 0,
				loss: chessBlitzRecordLoss = 0,
			} = {
				win: 0,
				loss: 0,
				draw: 0,
			},
		} = {
			last: { rating: 0, rd: 0 },
			best: { rating: 0 },
			record: { win: 0, draw: 0, loss: 0 },
		},
		chess_bullet: {
			last: {
				rating: chessBulletRatingLast = 0,
				rd: chessBulletRatingDeviation = 0,
			} = { rating: 0, rd: 0 },
			best: { rating: chessBulletRatingBest = 0 } = { rating: 0 },
			record: {
				win: chessBulletRecordWin = 0,
				draw: chessBulletRecordDraw = 0,
				loss: chessBulletRecordLoss = 0,
			} = {
				win: 0,
				loss: 0,
				draw: 0,
			},
		} = {
			last: { rating: 0, rd: 0 },
			best: { rating: 0 },
			record: { win: 0, draw: 0, loss: 0 },
		},
	} = statsData ?? {};
	const upsertData = {
		id,
		avatar,
		url,
		name,
		username,
		title,
		followers,
		country,
		location,
		lastOnline: new Date(lastOnline * 1000),
		joined: new Date(joined * 1000),
		status,
		isStreamer,
		twitchUrl,
		verified,
		league,
		chessRapidRatingLast,
		chessRapidRatingDeviation,
		chessRapidRatingBest,
		chessRapidRecordWin,
		chessRapidRecordDraw,
		chessRapidRecordLoss,
		chessBlitzRatingLast,
		chessBlitzRatingDeviation,
		chessBlitzRatingBest,
		chessBlitzRecordWin,
		chessBlitzRecordDraw,
		chessBlitzRecordLoss,
		chessBulletRatingLast,
		chessBulletRatingDeviation,
		chessBulletRatingBest,
		chessBulletRecordWin,
		chessBulletRecordDraw,
		chessBulletRecordLoss,
	};
	const { error } = await tryCatch(
		prismaClient.player.upsert({
			where: { id },
			update: upsertData,
			create: upsertData,
		}),
	);
	if (error) {
		logger.error(`❌ Error upsert player=${player} error=${error.message}`);
	}
	logger.info(`✅ Upserted player=${player}`);
};
