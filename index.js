const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Substitua pelo seu token de acesso permanente do Wrike
const wrikeAccessToken = process.env.WRIKE_ACCESS_TOKEN;

app.use(bodyParser.json());

console.log('Iniciando aplicação...');

// Rota para o caminho raiz ("/")
app.get('/', (req, res) => {
  console.log('Rota raiz acessada');
  res.send('Servidor está funcionando!');
});

// Endpoint para obter tarefas do Wrike
app.get('/wrike/tasks', async (req, res) => {
  console.log('Endpoint /wrike/tasks acessado');
  try {
    const response = await axios.get('https://www.wrike.com/api/v4/tasks', {
      headers: {
        'Authorization': `Bearer ${wrikeAccessToken}`
      }
    });

    console.log('Resposta da API do Wrike:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tasks from Wrike:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
