const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta actual
app.use(express.static(__dirname));

// Genera config.js dinamicamente desde variables de entorno de Render
// Asi las credenciales nunca estan en el repositorio
app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`const CONFIG = {
    AIRTABLE_URL: '${process.env.AIRTABLE_URL || ''}',
    AIRTABLE_TOKEN: '${process.env.AIRTABLE_TOKEN || ''}',
    N8N_WEBHOOK_URL: '${process.env.N8N_WEBHOOK_URL || ''}'
};`);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
