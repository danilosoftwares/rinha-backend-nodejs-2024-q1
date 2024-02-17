const { changeBalance, getExtractFromClient } = require("./dao");

module.exports = {

    create : (id, body, callback) => {
        const { valor, tipo, descricao } = body;
        changeBalance({id:id,value:valor,credit:tipo==="c",description:descricao},(status, result)=>{
            callback(status, result);       
        });        
    },
  
    extract : (id, callback) => {
        if (!id) {
            return {status:404, message: JSON.stringify({ error: 'ID não informado!' })};
        }
        getExtractFromClient(id,callback);
    },
  }