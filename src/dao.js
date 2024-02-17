const Connector = require('./connector');

const getExtractFromClient = (id, callback) => {
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
  Connector.query(sql, [id], (error, result) => {
    if (error) {
      callback(500, 'Erro desconhecido!');
    } else if (result.rows.length===0){
      callback(404, 'Cliente não encontrado!');
    } else {
      callback(200, 
        {saldo:{
          total:result.rows[0]["balance"],
          data_extrato:new Date().toISOString(),
          limite:result.rows[0]["limit_use"],
        }, 
        ultimas_transacoes:result.rows.slice(1).map((item)=>{
          return {valor:item.valor,tipo:item.tipo,descricao:item.descricao,realizado_em:item.realizado_em};
        })});
    }
  });
};

const changeBalance = (transaction, callback) => {
  const { id, value, credit, description } = transaction;
  Connector.query(`update clients set balance = balance ${credit ? '+' : '-'} $1 where id = $2  RETURNING *`, [value, id], (error, result) => {
    if (error) {
      if (error.constraint === "verificar") {
        callback(422, 'Saldo insuficiente!');
      } else {
        callback(500, 'Erro desconhecido!');
      }
    } else if (!result.rows.length) {
      callback(404, 'Cliente não encontrado!');
    } else {
      callback(200, { limite: result.rows[0].limit_use, saldo: result.rows[0].balance });
      Connector.query(`insert into transactions (id_client, credit_debit, amount, description) values ( $1, $2, $3, $4)`, [id, credit ? "c" : "d", value, description?description.substring(0,10):'']);
    }
  });
};


module.exports = {
  getExtractFromClient,
  changeBalance,
};
