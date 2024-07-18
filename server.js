const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const ConsultaApi = require('./private/consultaApi');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
