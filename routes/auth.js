const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'votre_secret_jwt_super_securise');
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Veuillez vous authentifier.' });
  }
};

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom } = req.body;
    const user = new User({ email, password, nom });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, 'votre_secret_jwt_super_securise');
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Identifiants invalides');
    }
    
    const token = jwt.sign({ userId: user._id }, 'votre_secret_jwt_super_securise');
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer le profil utilisateur
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router; 