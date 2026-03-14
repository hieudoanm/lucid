import { EasyOCR } from 'node-easyocr';

const ocr = new EasyOCR();

export const read = async (imagePath: string) => {
	await ocr.init(['en', 'fr']);
	const result = await ocr.readText(imagePath);
	return result;
};
