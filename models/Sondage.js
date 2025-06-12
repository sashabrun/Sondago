const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  intitule: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ouverte', 'qcm'],
    required: true
  },
  reponses: [{
    type: String
  }]
});

const sondageSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour updatedAt
sondageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Sondage', sondageSchema); 