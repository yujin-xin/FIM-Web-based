const express = require('express');
const path = require('path');
const app = express();

const port = 3000;

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve index.html on root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`🔐 File Integrity Monitor running on port ${port}`);
    console.log('Press Ctrl+C to stop the server');
});
