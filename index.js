const { validateCreate } = require('./src/validation');
const { create, extract } = require('./src/endpoints');
const express = require('express');

const contentType = { 'Content-Type': 'application/json', };


const app = express();

app.use(express.json()); 

app.post('/clientes/:id/transacoes', (req, res) => {
    const body = req.body;
    validateCreate(body,(content)=>{
        create(req.params.id, content, (status, message) => {
            res.writeHead(status, contentType).end(JSON.stringify(message));
        });
    },(status, error)=>{
        res.writeHead(status, contentType).end(JSON.stringify({ error: error }));
    }); 
  });

  app.get('/clientes/:id/extrato', (req, res) => {
    const { id } = req.params;
    extract(id, (status, message) => {
        res.writeHead(status, contentType).end(JSON.stringify(message));
    });
  });  

app.listen(3000, () => console.log('Servidor em execução na porta 3000'));
