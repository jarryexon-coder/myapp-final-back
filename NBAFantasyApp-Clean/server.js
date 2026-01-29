const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from web-build
app.use(express.static(path.join(__dirname, 'web-build')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Expo web app running on port ${PORT}`);
});
