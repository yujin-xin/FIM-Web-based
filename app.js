const express = require('express');
const path = require('path');
const app = express();

// Use PORT provided by Railway or default to 3000
const port = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Send index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Bind to 0.0.0.0 so Railway can access it
app.listen(port, '0.0.0.0', () => {
    console.log(`🔐 File Integrity Monitor running on port ${port}`);
    console.log('Press Ctrl+C to stop the server');
});