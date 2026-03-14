import { getPlayers, TITLES_MAP } from '../../clients/chess.client';
import { producer } from '../../clients/kafka.client';
import { logger } from '../../utils/log';
import { tryCatch } from '../../utils/try-catch';

export const producePlayerMessage = async ({
	title,
	titleMap,
}: {
	title: string;
	titleMap: string;
}): Promise<{ usernames: Set<string> }> => {
	await producer.connect();
	const usernames = new Set<string>();
	const titles = title !== '' ? [title] : TITLES_MAP.get(titleMap);
	for (const title of titles) {
		const { data: players = [] } = await tryCatch(getPlayers(title));
		if (!players) {
			logger.error(`❌ Error fetching players for title=${title}`);
			continue;
		}
		players.forEach(usernames.add, usernames);
		for (const player of players) {
			await producer.send({
				topic: 'chess-titled-player',
				messages: [{ value: JSON.stringify({ title, player }) }],
			});
			logger.info(`✅ Sent player=${player} with title=${title}`);
		}
	}
	await producer.disconnect();
	return { usernames };
};
