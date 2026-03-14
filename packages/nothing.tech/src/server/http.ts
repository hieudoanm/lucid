import { createServer } from 'node:http';
import { publicIpv4 } from 'public-ip';
import { logger } from '../utils/log';
import { enableCors } from '../utils/server';
import { apiRoutes } from './routes/api';
import { getPageRoute } from './routes/pages';

const httpServer = createServer(async (request, response) => {
	enableCors(response);

	const { method = '', url = '' } = request;
	const [path, queryString] = url.split('?');
	const query: URLSearchParams = new URLSearchParams(queryString);
	logger.info({ method, url, path, query });

	if (method === 'OPTIONS') {
		response.writeHead(204);
		response.end();
		return;
	}

	if (method === 'GET' && (!path.includes('api') || path.includes('favicon'))) {
		getPageRoute(request, response);
		return;
	}

	for (const route of apiRoutes) {
		const {
			method: routeMethod,
			path: routePath,
			function: routeFunction,
		} = route;
		if (method === routeMethod && path === routePath) {
			routeFunction(request, response);
			return;
		}
	}

	response.writeHead(404, { 'Content-Type': 'application/json' });
	response.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT: number = parseInt(process.env.PORT ?? '10000') ?? 10000;

export const startHttpServer = (): Promise<void> => {
	return new Promise((resolve) => {
		// starts a simple http server locally on port 10000
		httpServer.listen(PORT, '0.0.0.0', async () => {
			const publicIpV4: string = await publicIpv4();
			const message = `🚀 Server is listening on

- Local (host) : http://localhost:${PORT}
- Local (IP)   : http://127.0.0.1:${PORT}
- Network      : http://${publicIpV4}:${PORT}`;

			logger.info(message);
			resolve();
		});
	});
};
