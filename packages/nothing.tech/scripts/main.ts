import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import { writeFileSync } from 'node:fs';
import pdf2html from 'pdf2html';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const cwd = process.cwd();
console.info(cwd);

const NAME = process.env.NAME ?? 'sample';

pdfMake.vfs = pdfFonts.vfs;

const { window } = new JSDOM('');

const main = async () => {
	const html = await pdf2html.html(`${cwd}/examples/${NAME}.pdf`);
	writeFileSync(`${cwd}/output/html/${NAME}.html`, html);
	const converted = htmlToPdfmake(html, { window });
	const docDefinition = { content: converted };
	writeFileSync(
		`${cwd}/output/json/${NAME}.json`,
		JSON.stringify(docDefinition, null, 2),
	);
	pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
		writeFileSync(`${cwd}/output/pdf/${NAME}.pdf`, buffer);
	});
};

main();
