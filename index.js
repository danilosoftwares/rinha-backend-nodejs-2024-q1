const http = require('http');
const { validate, validateCreate } = require('./src/validation');
const { create, extract } = require('./src/endpoints');

const PORT = 3000;
const contentType = { 'Content-Type': 'application/json', };

const server = http.createServer((req, res) => {
    req.setTimeout(360000, () => {
        res.writeHead(500, contentType);
        res.end('Request timed out');
        req.destroy();
    });
    const { method, url } = req;
    validate(method, url, (id) => {
        if (method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                validateCreate(body,(content)=>{
                    create(id, content, (status, message) => {
                        res.writeHead(status, contentType).end(JSON.stringify(message));
                    });
                },(status, error)=>{
                    res.writeHead(status, contentType).end(JSON.stringify({ error: error }));
                });          
            });
        } else {
            extract(id, (status, message) => {
                res.writeHead(status, contentType).end(JSON.stringify(message));
            });
        }
    }, (status, error) => {
        res.writeHead(status, contentType).end(JSON.stringify({ error: error }));
    });
});

server.on('error', (err) => {
    console.error('Erro no servidor:', err.message);
  });

server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
