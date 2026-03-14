import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import { createWriteStream } from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import pdf2html from 'pdf2html';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logger } from '../../../../../utils/log';

const CWD = process.cwd();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(<any>pdfMake).vfs = pdfFonts.vfs;

const { window } = new JSDOM('');

export const postRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	try {
		logger.info(request, 'request');

		const filePath: string = path.join(CWD, 'uploads', 'sample.pdf');
		logger.info(`filePath=${filePath}`);
		const writeStream = createWriteStream(filePath);
		request.pipe(writeStream);

		writeStream.on('finish', async () => {
			const filePath: string = path.join(CWD, 'uploads', 'sample.pdf');
			const html: string = await pdf2html.html(filePath);
			const data = htmlToPdfmake(html, { window });
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ error: null, data }));
		});

		writeStream.on('error', (error) => {
			response.end(JSON.stringify({ error: error.message, data: null }));
		});
	} catch (error) {
		response.end(
			JSON.stringify({ error: (error as Error).message, data: null }),
		);
	}
};
