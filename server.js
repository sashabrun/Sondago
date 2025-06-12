const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion à MongoDB
mongoose.connect('mongodb://root:example@localhost:27017/sondago?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sondages', require('./routes/sondages'));
app.use('/api/reponses', require('./routes/reponses'));

// Route par défaut pour servir l'application frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 