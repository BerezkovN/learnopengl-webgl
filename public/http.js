import express from 'express';
import serveStatic from 'serve-static';

const staticBasePath = './public/';

const app = express();

app.use(serveStatic(staticBasePath));
app.listen(8080);
console.log('Listening on port 8080');