const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const Connector = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  port: 5432,
});


fs.readFile(process.env.DIRECTORY_SCRIPT,(async (error, script)=>{
  if (error){
    console.log('não foi possivel abrir arquivo de script base: ',error.message);
    return;
  }
  let success = false;
  for (let i = 0; i <= 10; i++) {
    try{
      await Connector.query(script.toString());
      success = true;
    } catch(e){
      console.log(e);
    }
    if (success){
      break;
    } else {
      await new Promise(resolve => setTimeout(resolve, 5000));       
    }
  }  
  if (!success)
    console.log('Todas as tentativas de conexão falharam.');
  else  
    console.log('Script inicial executado no banco com sucesso.');
}));




module.exports = Connector;