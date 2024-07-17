// private/consultaApi.js
const axios = require('axios');

class ConsultaApi {
    static async consultaVideo(id, token) {
        try {
            const response = await axios.post('https://integrador.apollocompany.com.br/webhook/8a4c54f0-a31b-4e88-a97e-7b4c01b158ba', {
                id: id,
                token: token
            });
            return response.data;
        } catch (error) {
            console.error('Erro na consulta do vídeo:', error);
            throw error;
        }
    }
}

module.exports = ConsultaApi;
