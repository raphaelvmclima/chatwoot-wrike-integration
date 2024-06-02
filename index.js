const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // Adicione esta linha

const app = express();
const port = process.env.PORT || 3000;

// Configuração de CORS
const corsOptions = {
  origin: '*', // Permitir todas as origens. Substitua por um domínio específico se necessário.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Adicione esta linha

app.use(bodyParser.json());

// Substitua pelos seus valores de OAuth do Wrike
const wrikeClientId = process.env.WRIKE_CLIENT_ID;
const wrikeClientSecret = process.env.WRIKE_CLIENT_SECRET;
const wrikeRedirectUri = process.env.WRIKE_REDIRECT_URI;
const wrikeWorkspaceUrl = 'https://www.wrike.com/workspace.htm'; // URL do workspace do Wrike

console.log('Iniciando aplicação...');

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`Recebida requisição: ${req.method} ${req.url}`);
  next();
});

// Rota para o caminho raiz ("/")
app.get('/', (req, res) => {
  console.log('Rota raiz acessada');
  res.send('Servidor está funcionando!');
});

// Endpoint para iniciar o fluxo OAuth do Wrike
app.get('/wrike/login', (req, res) => {
  console.log('Endpoint /wrike/login acessado');
  const wrikeAuthUrl = `https://login.wrike.com/oauth2/authorize/v4?client_id=${wrikeClientId}&response_type=code&redirect_uri=${wrikeRedirectUri}`;
  console.log(`Redirecionando para: ${wrikeAuthUrl}`);
  res.redirect(wrikeAuthUrl);
});

// Endpoint de callback para o Wrike OAuth
app.get('/callback', async (req, res) => {
  console.log('Endpoint /callback acessado');
  const authCode = req.query.code;
  console.log(`Código de autorização recebido: ${authCode}`);

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

// Endpoint para obter tarefas do Wrike
app.get('/wrike/tasks', async (req, res) => {
  console.log('Endpoint /wrike/tasks acessado');
  try {
    const response = await axios.get('https://www.wrike.com/api/v4/tasks', {
      headers: {
        'Authorization': `Bearer ${process.env.WRIKE_ACCESS_TOKEN}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tasks from Wrike:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
