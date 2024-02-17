
module.exports = {

  validate: (method, url) => {
    try{
      if (method !== "POST" && method !== "GET") {
        return { status: 405, error: 'Método não suportado!' };
      } else {
        const regex = /^\d+$/;
        const separate = url.split('/');
        const total = separate.length;
        if (total !== 4 || (separate[1].toLowerCase() !== "clientes" || (!(method === "POST" && separate[3].toLowerCase() === "transacoes") && !(method === "GET" && separate[3].toLowerCase() === "extrato")))) {
          return { status: 404, error: 'Rota inválida!', id:undefined };
        } else if (!regex.test(separate[2])) {
          return { status: 404, error: 'Id de Cliente inválido!', id:undefined };
        }
        return { status: 200, error: undefined, id:separate[2] };
      }
    } catch(e) {
      return { status: 500, error: e, id:undefined };
    }
  },

  validateCreate: (body) => {
    try{    
      const payload = JSON.parse(body);
      if(payload.tipo.toLowerCase()!=="c"&&payload.tipo.toLowerCase()!=="d"){
        return { status: 400, error: "Atributo tipo inválido!", content:payload };
      }
      return { status: 200, error: undefined, content:payload };
    } catch(e) {
      return { status: 500, error: e, content:undefined };
    }
  },

}