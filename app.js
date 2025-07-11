const express = require('express');
const path = require('path');
const app = express();


const port = process.env.PORT || 3000;

app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.listen(port, '0.0.0.0', () => {
    console.log(`🔐 File Integrity Monitor running on port ${port}`);
    console.log('Press Ctrl+C to stop the server');
});