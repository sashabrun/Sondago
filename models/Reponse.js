const mongoose = require('mongoose');

const reponseSchema = new mongoose.Schema({
  sondage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sondage',
    required: true
  },
  utilisateur_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reponses: [{
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reponse: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour éviter les réponses en double
reponseSchema.index({ sondage_id: 1, utilisateur_id: 1 }, { unique: true });

module.exports = mongoose.model('Reponse', reponseSchema); 