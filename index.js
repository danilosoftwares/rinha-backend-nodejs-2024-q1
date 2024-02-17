const http = require('http');
const { validate, validateCreate } = require('./src/validation');
const { create, extract } = require('./src/endpoints');

const PORT = 3000;
const contentType = { 'Content-Type': 'application/json', };

const server = http.createServer((req, res) => {
    const { method, url } = req;
    validate(method, url, (id) => {
        if (method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', async () => {
                validateCreate(body,(content)=>{
                    create(id, content, (status, message) => {
                        res.writeHead(status, contentType).end(JSON.stringify(message));
                    });
                },(status, error)=>{
                    return res.writeHead(status, contentType).end(JSON.stringify({ error: error }));
                });          
            });
            return;
        } else {
            extract(id, (status, message) => {
                res.writeHead(status, contentType).end(JSON.stringify(message));
            });
        }
    }, (status, error) => {
        return res.writeHead(status, contentType).end(JSON.stringify({ error: error }));
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
