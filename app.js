const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from current directory
app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(port, '0.0.0.0' ,() => {
    console.log(`🔐 File Integrity Monitor running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
}); 