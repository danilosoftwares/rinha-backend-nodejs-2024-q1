const http = require('http');
const { validate, validateCreate } = require('./src/validation');
const { create, extract } = require('./src/endpoints');

const PORT = 3000;
const contentType =  { 'Content-Type': 'application/json', };

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const { status, error, id } = validate(method,url);
    if (status !== 200) {
        return res.writeHead(status,contentType).end(JSON.stringify({ error: error }));
    } else {            
        if (method === 'POST') {            
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', async () => {
                const { status, error, content } = validateCreate(body);
                if (status !== 200) {
                    return res.writeHead(status,contentType).end(JSON.stringify({ error: error }));
                } else {                   
                    create(id, content,(status, message)=>{
                        res.writeHead(status, contentType).end(JSON.stringify(message));
                    });  
                }                          
            });
            return;
        } else {            
            extract(id,(status,message)=>{
                res.writeHead(status, contentType).end(JSON.stringify(message));
            });            
        }
    }
});

server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
