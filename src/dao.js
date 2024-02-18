const Connector = require('./connector');

const getExtractFromClient = async (id, callback) => {
  Connector.tx(async t => {  
    const sql = `
      select limit_use, 0 valor, '' tipo, '' descricao,null realizado_em, balance
      from clients 
      where id  = $1
      union all
      (
        select 0 limit_use, amount as valor, credit_debit as tipo ,description as descricao, created_at as realizado_em,0 balance
        from transactions
        where id_client  = $1
        order by created_at desc  
        limit 10
      )
    `;
    try{
      const result = await t.query(sql, [id]);    
      if (result.length===0){
        callback(404, 'Cliente não encontrado!');
      } else {        
        callback(200, 
          {saldo:{
            total:result[0]["balance"],
            data_extrato:new Date().toISOString(),
            limite:result[0]["limit_use"],
          }, 
          ultimas_transacoes:result.slice(1).map((item)=>{
            return {valor:item.valor,tipo:item.tipo,descricao:item.descricao,realizado_em:item.realizado_em};
          })});         
      }
    } catch(e){      
      callback(500, 'Erro desconhecido!');      
    }
  });
};

const changeBalance = async (transaction, callback) => {
  const { id, value, credit, description } = transaction;
  Connector.tx(async t => {
    try{
      const results = await t.query(`update clients set balance = balance ${credit ? '+' : '-'} $1 where id = $2  RETURNING *`,[value, id]);
      if (!results.length) {
        callback(404, 'Cliente não encontrado!');
      } else {
        callback(200, { limite: results[0].limit_use, saldo: results[0].balance });      
        t.query(`insert into transactions (id_client, credit_debit, amount, description) values ( $1, $2, $3, $4)`, [id, credit ? "c" : "d", value, description?description.substring(0,10):'']);
      }
    }catch(e){
      if (e) {
        if (e.constraint === "verificar") {
          callback(422, 'Saldo insuficiente!');        
        } else {
          callback(500, 'Erro desconhecido!');        
        }
      }  
    }
  });
};


module.exports = {
  getExtractFromClient,
  changeBalance,
};
