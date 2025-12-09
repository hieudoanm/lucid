import { getRoute as getChessTitledRoute } from './chess/titled/get';
import { postRoute as postChessTitledRoute } from './chess/titled/post';
import { postRoute as postEasyOcrRead } from './easy-ocr/read/post';
import { postRoute as postGraphQlRoute } from './graphql/post';
import { postRoute as postInstagramDownloadRoute } from './instagram/download/post';
import { postRoute as postConvertRoute } from './pdfmake/convert/post';
import { postRoute as postStockfishEvaluate } from './stockfish/evaluate/post';

export const apiRoutes = [
  { method: 'GET', path: '/api/chess/titled', function: getChessTitledRoute },
  { method: 'POST', path: '/api/chess/titled', function: postChessTitledRoute },
  { method: 'POST', path: '/api/easy-ocr/read', function: postEasyOcrRead },
  { method: 'POST', path: '/api/graphql', function: postGraphQlRoute },
  {
    method: 'POST',
    path: '/api/instagram/download',
    function: postInstagramDownloadRoute,
  },
  {
    method: 'POST',
    path: '/api/pdfmake/convert',
    function: postConvertRoute,
  },
  {
    method: 'POST',
    path: '/api/stockfish/evaluate',
    function: postStockfishEvaluate,
  },
];
