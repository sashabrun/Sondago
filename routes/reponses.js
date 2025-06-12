const express = require('express');
const router = express.Router();
const Reponse = require('../models/Reponse');
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

// Soumettre une réponse
router.post('/', auth, async (req, res) => {
  try {
    const reponse = new Reponse({
      ...req.body,
      utilisateur_id: req.userId
    });
    await reponse.save();
    res.status(201).json(reponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer les réponses d'un sondage
router.get('/sondage/:sondageId', auth, async (req, res) => {
  try {
    const reponses = await Reponse.find({ sondage_id: req.params.sondageId })
      .populate('utilisateur_id', 'nom email')
      .sort({ createdAt: -1 });
    res.json(reponses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les réponses d'un utilisateur
router.get('/utilisateur', auth, async (req, res) => {
  try {
    const reponses = await Reponse.find({ utilisateur_id: req.userId })
      .populate('sondage_id')
      .sort({ createdAt: -1 });
    res.json(reponses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une réponse
router.put('/:id', auth, async (req, res) => {
  try {
    const reponse = await Reponse.findById(req.params.id);
    if (!reponse) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    if (reponse.utilisateur_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    Object.assign(reponse, req.body);
    await reponse.save();
    res.json(reponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une réponse
router.delete('/:id', auth, async (req, res) => {
  try {
    const reponse = await Reponse.findById(req.params.id);
    if (!reponse) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    if (reponse.utilisateur_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    await Reponse.deleteOne({ _id: req.params.id });
    res.json({ message: 'Réponse supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 