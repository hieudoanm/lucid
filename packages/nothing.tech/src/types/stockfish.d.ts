declare module 'stockfish' {
	const stockfish: () => {
		postMessage: (cmd: string) => void;
		onmessage: ((line: string) => void) | null;
	};
	export = stockfish;
}
