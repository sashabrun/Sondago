# Sondago - Application de Sondages

## Description du Projet
Sondago est une application web permettant de créer et gérer des sondages. Elle permet aux utilisateurs de créer des sondages avec différents types de questions (ouverte ou à choix multiples), de répondre aux sondages et de visualiser les résultats.

### Fonctionnalités Principales
- Création, modification et suppression de sondages
- Gestion des utilisateurs (inscription, connexion)
- Types de questions variés (ouverte, choix multiples)
- Visualisation des réponses aux sondages
- Interface utilisateur intuitive

## Sommaire
1. [Architecture Technique](#architecture-technique)
2. [Installation avec Docker](#installation-avec-docker)
3. [Structure du Projet](#structure-du-projet)
4. [Exemple de Création d'une Route](#exemple-de-création-dune-route)
5. [Modèles de Données](#modèles-de-données)
6. [Sécurité](#sécurité)

## Architecture Technique
- **Backend**: Node.js avec Express
- **Base de données**: MongoDB avec Mongoose
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Authentification**: JWT (JSON Web Tokens)
- **Conteneurisation**: Docker avec Docker Compose

## Installation avec Docker

### Prérequis
- Docker
- Docker Compose

### Démarrage Rapide
```bash
# Cloner le repository
git clone [URL_DU_REPO]

# Démarrer l'application
docker-compose up --build
```

### Accès aux Services
Une fois démarré, vous pouvez accéder à :
- Application : http://localhost:3000
- Mongo Express (interface d'administration MongoDB) : http://localhost:8081
  - Utilisateur : root
  - Mot de passe : example

### Commandes Docker Utiles
```bash
# Démarrer l'application
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter l'application
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire les images
docker-compose build

# Arrêter et supprimer les volumes (données)
docker-compose down -v
```

## Structure du Projet
```
sondago/
├── models/              # Modèles Mongoose
├── routes/             # Routes Express
├── public/             # Fichiers statiques
│   ├── css/
│   ├── js/
│   └── index.html
├── server.js           # Point d'entrée
├── Dockerfile          # Configuration Docker
└── docker-compose.yml  # Configuration Docker Compose
```

## Exemple de Création d'une Route

### 1. Création du Modèle
```javascript
// models/Sondage.js
const mongoose = require('mongoose');

const sondageSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  createur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [{
    texte: String,
    type: { type: String, enum: ['ouverte', 'choix_multiple'] },
    choix: [String]
  }]
});

module.exports = mongoose.model('Sondage', sondageSchema);
```

### 2. Création de la Route
```javascript
// routes/sondages.js
const express = require('express');
const router = express.Router();
const Sondage = require('../models/Sondage');
const auth = require('../middleware/auth');

// Créer un sondage
router.post('/', auth, async (req, res) => {
  try {
    const sondage = new Sondage({
      ...req.body,
      createur: req.user._id
    });
    await sondage.save();
    res.status(201).json(sondage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

### 3. Intégration Frontend
```javascript
// public/app.js
async function createSurvey(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const surveyData = {
    nom: formData.get('nom'),
    questions: // ... logique de collecte des questions
  };

  try {
    const response = await fetch('/api/sondages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(surveyData)
    });
    // ... gestion de la réponse
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

## Modèles de Données

### Sondage
```javascript
{
  nom: String,          // Nom unique du sondage
  createur: ObjectId,   // Référence à l'utilisateur
  questions: [{
    texte: String,      // Texte de la question
    type: String,       // 'ouverte' ou 'choix_multiple'
    choix: [String]     // Options pour choix_multiple
  }]
}
```

### Réponse
```javascript
{
  sondage_id: ObjectId, // Référence au sondage
  utilisateur_id: ObjectId, // Référence à l'utilisateur
  reponses: [{
    question_id: Number, // Index de la question
    reponse: String     // Réponse donnée
  }]
}
```

## Sécurité
- Authentification JWT
- Validation des données
- Protection des routes sensibles
- Gestion des erreurs
- Sanitization des entrées utilisateur

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request 