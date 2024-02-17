
module.exports = {

  validate: (method, url, onSuccess, onError) => {
    try {
      if (method !== "POST" && method !== "GET") {
        onError(405, 'Método não suportado!');
      } else {
        const regex = /^\d+$/;
        const separate = url.split('/');
        const total = separate.length;
        if (total !== 4 || (separate[1].toLowerCase() !== "clientes" || (!(method === "POST" && separate[3].toLowerCase() === "transacoes") && !(method === "GET" && separate[3].toLowerCase() === "extrato")))) {
          onError(404, 'Rota inválida!');
        } else if (!regex.test(separate[2])) {
          onError(404, 'Id de Cliente inválido!');
        } else {
          onSuccess(separate[2]);
        }
      }
    } catch (e) {
      onError(500, e);
    }
  },

  validateCreate: (body, onSuccess, onError) => {
    try {
      const payload = JSON.parse(body);
      if (payload.tipo.toLowerCase() !== "c" && payload.tipo.toLowerCase() !== "d") {
        onError(422, "Atributo tipo inválido!");
      } else if (!payload.descricao || (payload.descricao.length > 10 || payload.descricao.length === 0)) {
        onError(422, "Atributo descricao inválido!");
      } else {
        const regex = /^\d+$/;
        const text = payload.valor.toString();
        const valid = regex.test(text) && !text.includes(".");
        if (!valid) {
          onError(422, "Atributo valor inválido!");
        } else {
          onSuccess(payload);
        }
      }
    } catch (e) {
      onError(500, e);
    }
  },

}