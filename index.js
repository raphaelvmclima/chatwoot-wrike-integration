const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Substitua pelos seus valores de OAuth do Wrike
const wrikeClientId = process.env.WRIKE_CLIENT_ID;
const wrikeClientSecret = process.env.WRIKE_CLIENT_SECRET;
const wrikeRedirectUri = process.env.WRIKE_REDIRECT_URI;
const wrikeWorkspaceUrl = 'https://www.wrike.com/workspace.htm'; // URL do workspace do Wrike

app.use(bodyParser.json());

console.log('Iniciando aplicação...');

// Rota para o caminho raiz ("/")
app.get('/', (req, res) => {
  console.log('Rota raiz acessada');
  res.send('Servidor está funcionando!');
});

// Endpoint para iniciar o fluxo OAuth do Wrike
app.get('/wrike/login', (req, res) => {
  const wrikeAuthUrl = `https://login.wrike.com/oauth2/authorize/v4?client_id=${wrikeClientId}&response_type=code&redirect_uri=${wrikeRedirectUri}`;
  res.redirect(wrikeAuthUrl);
});

// Endpoint de callback para o Wrike OAuth
app.get('/callback', async (req, res) => {
  const authCode = req.query.code;

  try {
    const tokenResponse = await axios.post('https://login.wrike.com/oauth2/token', null, {
      params: {
        client_id: wrikeClientId,
        client_secret: wrikeClientSecret,
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: wrikeRedirectUri
      }
    });

    const accessToken = tokenResponse.data.access_token;
    console.log(`Access Token: ${accessToken}`);
    res.redirect(wrikeWorkspaceUrl);
  } catch (error) {
    console.error('Error fetching access token from Wrike:', error.response ? error.response.data : error.message);
    res.status(500).send('Erro ao obter token de acesso');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
