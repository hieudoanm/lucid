import { spawn } from 'node:child_process';
import { logger } from '../../utils/log';

export const evaluate = ({
	depth = 15,
	fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
	multiPv = 1,
}: {
	depth: number;
	fen: string;
	multiPv: number;
}): Promise<{
	pvs: { move: string; cp: number }[];
}> => {
	return new Promise((resolve) => {
		const engine = spawn('stockfish');

		engine.stdin.write('uci\n');
		engine.stdin.write('setoption name Minimum Thinking Time value 30\n');
		engine.stdin.write(`setoption name MultiPV value ${multiPv}\n`);
		engine.stdin.write('setoption name Skill Level value 20\n');
		engine.stdin.write('setoption name Threads value 2\n');
		engine.stdin.write(`position fen ${fen}\n`);
		engine.stdin.write(`go depth ${depth}\n`);

		engine.stdout.on('data', (data) => {
			const output = data.toString(); // Convert buffer to string
			logger.info(output, 'engine.output');
			const lines = output.split('\n');
			logger.info(lines, 'engine.lines');

			const moves: { move: string; cp: number }[] = [];
			lines.forEach((line: string) => {
				if (
					line.startsWith('info') &&
					line.includes('multipv') &&
					line.includes('score cp')
				) {
					const match = line.match(
						/multipv (\d+).*?score cp (-?\d+).*?pv (.+)/,
					);
					if (match) {
						const index = parseInt(match[1]) - 1;
						const cp: number = parseInt(match[2]);
						const move = match[3];
						logger.info({ move, cp }, 'engine.move');
						moves[index] = { move, cp };
					}
				}

				logger.info(moves, 'engine.moves');

				if (line.startsWith('bestmove')) {
					resolve({
						pvs: moves.filter(Boolean).slice(0, multiPv),
					});
					engine.stdin.write('quit\n');
				}
			});
		});
	});
};
