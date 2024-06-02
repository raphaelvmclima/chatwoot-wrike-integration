const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // Adiciona esta linha

const app = express();
const port = process.env.PORT || 3000;

// Substitua pelo seu token de acesso permanente do Wrike
const wrikeAccessToken = process.env.WRIKE_ACCESS_TOKEN;
const clientId = process.env.WRIKE_CLIENT_ID;
const clientSecret = process.env.WRIKE_CLIENT_SECRET;
const redirectUri = process.env.WRIKE_REDIRECT_URI;

app.use(bodyParser.json());
app.use(cors()); // Adiciona esta linha

// Rota de login para obter autorização do Wrike
app.get('/wrike/login', (req, res) => {
    const authUrl = `https://login.wrike.com/oauth2/authorize/v4?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
});

// Rota de callback para lidar com o código de autorização e obter o token de acesso
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post('https://login.wrike.com/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }
        });

        const accessToken = response.data.access_token;
        res.send(`Access Token: ${accessToken}`);
    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Error getting access token');
    }
});

// Endpoint para obter tarefas do Wrike
app.get('/wrike/tasks', async (req, res) => {
    try {
        const response = await axios.get('https://www.wrike.com/api/v4/tasks', {
            headers: {
                'Authorization': `Bearer ${wrikeAccessToken}`
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
