const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.set('trust proxy', true); // added after for deployment purposes.
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.API_KEY;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get geolocation data for an IP
app.get('/api/geolocation/:ip', async (req, res) => {
  const ip = req.params.ip === 'myip' ? 'check' : req.params.ip;
  
  try {
    const response = await fetch(
      `https://api.ipstack.com/${ip}?access_key=${ACCESS_KEY}`
    );
    const data = await response.json();
    
    if (data.success === false) {
      return res.status(400).json({ error: data.error.info });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error fetching IP data:', error);
    return res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
});

// Endpoint to use my IP, added this for testing purposes (can skip)
app.get('/api/myip', (req, res) => {
  // Get users IP from the request  **changed after for deployment purposes***
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;
  res.json({ ip });

});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});