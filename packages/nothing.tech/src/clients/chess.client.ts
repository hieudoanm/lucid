const PROXY_URL = 'https://hieudoanm-reverse-proxy.vercel.app';

export const OPEN_TITLES = ['GM', 'IM', 'FM', 'NM', 'CM'];
export const WOMAN_TITLES = ['WGM', 'WIM', 'WFM', 'WNM', 'WCM'];
export const TITLES = [...OPEN_TITLES, ...WOMAN_TITLES];

export const TITLES_MAP = new Map();
TITLES_MAP.set('all', TITLES);
TITLES_MAP.set('open', OPEN_TITLES);
TITLES_MAP.set('woman', WOMAN_TITLES);

const proxy = (url: string) => `${PROXY_URL}/api?url=${url}`;

export const getPlayers = async (title: string): Promise<string[]> => {
	const url = `https://api.chess.com/pub/titled/${title}`;
	const response = await fetch(proxy(url));
	const data: { players: string[] } = await response.json();
	const { players = [] } = data;
	return players;
};

export const getPlayer = async (player: string) => {
	const playerUrl = `https://api.chess.com/pub/player/${player}`;
	const playerResponse = await fetch(proxy(playerUrl));
	const playerData = await playerResponse.json();
	return playerData;
};

export const getStats = async (player: string) => {
	const statsUrl = `https://api.chess.com/pub/player/${player}/stats`;
	const statsResponse = await fetch(proxy(statsUrl));
	const statsData = await statsResponse.json();
	return statsData;
};
