const express = require('express');
const router = express.Router();
const Sondage = require('../models/Sondage');
const jwt = require('jsonwebtoken');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'votre_secret_jwt_super_securise');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Veuillez vous authentifier.' });
  }
};

// Créer un sondage
router.post('/', auth, async (req, res) => {
  try {
    const sondage = new Sondage({
      ...req.body,
      createur: req.userId
    });
    await sondage.save();
    res.status(201).json(sondage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer tous les sondages
router.get('/', async (req, res) => {
  try {
    const sondages = await Sondage.find().populate('createur', 'nom email');
    res.json(sondages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un sondage spécifique
router.get('/:id', async (req, res) => {
  try {
    const sondage = await Sondage.findById(req.params.id).populate('createur', 'nom email');
    if (!sondage) {
      return res.status(404).json({ error: 'Sondage non trouvé' });
    }
    res.json(sondage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un sondage
router.put('/:id', auth, async (req, res) => {
  try {
    const sondage = await Sondage.findById(req.params.id);
    if (!sondage) {
      return res.status(404).json({ error: 'Sondage non trouvé' });
    }
    
    if (sondage.createur.toString() !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    Object.assign(sondage, req.body);
    await sondage.save();
    res.json(sondage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un sondage
router.delete('/:id', auth, async (req, res) => {
  try {
    const sondage = await Sondage.findById(req.params.id);
    if (!sondage) {
      return res.status(404).json({ error: 'Sondage non trouvé' });
    }
    
    if (sondage.createur.toString() !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    await sondage.remove();
    res.json({ message: 'Sondage supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 