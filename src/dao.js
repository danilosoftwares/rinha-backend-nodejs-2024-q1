const Connector = require('./connector');

const infoClient = `
select limit_use, balance
from clients 
where id  = $1
FOR UPDATE
`;

const getExtractFromClient = async (id, callback) => {
  Connector.tx(async t => {
    try {
      const result = await t.query(infoClient, [id]);
      if (result.length === 0) {
        callback(404, 'Cliente não encontrado!');
      } else {
        const infoTransactions = `
          select amount as valor, credit_debit as tipo ,description as descricao, created_at as realizado_em
          from transactions
          where id_client  = $1
          order by created_at desc  
          limit 10
        `;
        const resultTransactions = await t.query(infoTransactions, [id]);
        callback(200,
          {
            saldo: {
              total: result[0]["balance"],
              data_extrato: new Date().toISOString(),
              limite: result[0]["limit_use"],
            },
            ultimas_transacoes: resultTransactions.map((item) => {
              return { valor: item.valor, tipo: item.tipo, descricao: item.descricao, realizado_em: item.realizado_em };
            })
          });
      }
    } catch (e) {
      callback(500, 'Erro desconhecido!');
    }
  });
};

const changeBalance = async (transaction, callback) => {
  const { id, value, credit, description } = transaction;
  Connector.tx(async t => {
    try {
      const exists = await t.query(infoClient, [id]);
      if (!exists.length) {
        callback(404, 'Cliente não encontrado!');
      } else {
        if (credit) {
          callback(200, { limite: exists[0].limit_use, saldo: exists[0].balance + value });
          t.query(`update clients set balance = balance ${credit ? '+' : '-'} $1 where id = $2  RETURNING *`, [value, id]);
          t.query(`insert into transactions (id_client, credit_debit, amount, description) values ( $1, $2, $3, $4)`, [id, credit ? "c" : "d", value, description ? description.substring(0, 10) : '']);
        } else {
          if (((exists[0].balance - value) < (exists[0].limit_use * -1))) {
            callback(422, 'Saldo insuficiente!');
          } else {
            callback(200, { limite: exists[0].limit_use, saldo: exists[0].balance - value });
            t.query(`update clients set balance = balance ${credit ? '+' : '-'} $1 where id = $2  RETURNING *`, [value, id]);
            t.query(`insert into transactions (id_client, credit_debit, amount, description) values ( $1, $2, $3, $4)`, [id, credit ? "c" : "d", value, description ? description.substring(0, 10) : '']);
          }
        }
      }
    } catch (e) {
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
