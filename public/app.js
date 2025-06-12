// Configuration
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let token = localStorage.getItem('token');

// Éléments DOM
const authSection = document.getElementById('authSection');
const surveysSection = document.getElementById('surveysSection');
const createSurveySection = document.getElementById('createSurveySection');
const answerSurveySection = document.getElementById('answerSurveySection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const createSurveyLink = document.getElementById('createSurveyLink');
const mySurveysLink = document.getElementById('mySurveysLink');
const homeLink = document.getElementById('homeLink');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadSurveys();
});

// Vérification de l'authentification
function checkAuth() {
    if (token) {
        fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            updateUIForAuth();
        })
        .catch(() => {
            localStorage.removeItem('token');
            token = null;
            currentUser = null;
            updateUIForAuth();
        });
    } else {
        updateUIForAuth();
    }
}

// Mise à jour de l'interface selon l'état d'authentification
function updateUIForAuth() {
    if (currentUser) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        createSurveyLink.style.display = 'inline';
        mySurveysLink.style.display = 'inline';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        logoutLink.style.display = 'none';
        createSurveyLink.style.display = 'none';
        mySurveysLink.style.display = 'none';
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(authSection);
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(authSection);
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        token = null;
        currentUser = null;
        updateUIForAuth();
        showSection(surveysSection);
    });

    createSurveyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(createSurveySection);
    });

    mySurveysLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadUserSurveys();
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(surveysSection);
        loadSurveys();
    });

    // Formulaires
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('createSurveyForm').addEventListener('submit', handleCreateSurvey);
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestionField);
}

// Gestionnaires de formulaires
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            updateUIForAuth();
            showSection(surveysSection);
            loadSurveys();
        } else {
            showError(form, data.error);
        }
    } catch (error) {
        showError(form, 'Erreur de connexion');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const nom = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            updateUIForAuth();
            showSection(surveysSection);
            loadSurveys();
        } else {
            showError(form, data.error);
        }
    } catch (error) {
        showError(form, 'Erreur d\'inscription');
    }
}

async function handleCreateSurvey(e) {
    e.preventDefault();
    const form = e.target;
    const nom = form.querySelector('input[type="text"]').value;
    const questions = Array.from(form.querySelectorAll('.question-container')).map(container => {
        const intitule = container.querySelector('input[type="text"]').value;
        const type = container.querySelector('select').value;
        const reponses = type === 'qcm' 
            ? container.querySelector('textarea').value.split('\n').filter(r => r.trim())
            : [];
        return { intitule, type, reponses };
    });

    try {
        const response = await fetch(`${API_URL}/sondages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nom, questions })
        });

        const data = await response.json();
        if (response.ok) {
            showSection(surveysSection);
            loadSurveys();
        } else {
            showError(form, data.error);
        }
    } catch (error) {
        showError(form, 'Erreur lors de la création du sondage');
    }
}

// Fonctions utilitaires
function showSection(section) {
    [authSection, surveysSection, createSurveySection, answerSurveySection].forEach(s => {
        s.style.display = 'none';
    });
    section.style.display = 'block';
}

function showError(form, message) {
    const errorDiv = form.querySelector('.error') || document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    if (!form.querySelector('.error')) {
        form.appendChild(errorDiv);
    }
}

function addQuestionField() {
    const container = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
    questionDiv.innerHTML = `
        <input type="text" placeholder="Intitulé de la question" required>
        <select required>
            <option value="ouverte">Question ouverte</option>
            <option value="qcm">QCM</option>
        </select>
        <textarea placeholder="Réponses possibles (une par ligne)" style="display: none;"></textarea>
        <div class="question-actions">
            <button type="button" class="remove-question">Supprimer</button>
        </div>
    `;

    const select = questionDiv.querySelector('select');
    const textarea = questionDiv.querySelector('textarea');
    select.addEventListener('change', () => {
        textarea.style.display = select.value === 'qcm' ? 'block' : 'none';
    });

    questionDiv.querySelector('.remove-question').addEventListener('click', () => {
        questionDiv.remove();
    });

    container.appendChild(questionDiv);
}

async function loadSurveys() {
    try {
        const response = await fetch(`${API_URL}/sondages`);
        const sondages = await response.json();
        displaySurveys(sondages);
    } catch (error) {
        console.error('Erreur lors du chargement des sondages:', error);
    }
}

async function loadUserSurveys() {
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/sondages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const sondages = await response.json();
        displaySurveys(sondages.filter(s => s.createur._id === currentUser._id));
    } catch (error) {
        console.error('Erreur lors du chargement des sondages:', error);
    }
}

function displaySurveys(sondages) {
    const container = document.getElementById('surveysList');
    container.innerHTML = '';

    sondages.forEach(sondage => {
        const card = document.createElement('div');
        card.className = 'survey-card';
        card.innerHTML = `
            <h3>${sondage.nom}</h3>
            <p>Créé par: ${sondage.createur.nom}</p>
            <p>${sondage.questions.length} questions</p>
            <button onclick="showSurvey('${sondage._id}')">Voir le sondage</button>
            ${currentUser && sondage.createur._id === currentUser._id ? `
                <button onclick="editSurvey('${sondage._id}')">Modifier</button>
                <button onclick="deleteSurvey('${sondage._id}')">Supprimer</button>
                <button onclick="showResponses('${sondage._id}')">Voir les réponses</button>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

async function showSurvey(id) {
    try {
        const response = await fetch(`${API_URL}/sondages/${id}`);
        const sondage = await response.json();
        
        const container = document.getElementById('answersContainer');
        container.innerHTML = '';
        
        sondage.questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-container';
            
            let inputHtml = '';
            if (question.type === 'ouverte') {
                inputHtml = `<input type="text" name="q_${question._id}" required>`;
            } else {
                inputHtml = question.reponses.map((reponse, index) => `
                    <label>
                        <input type="checkbox" name="q_${question._id}" value="${reponse}">
                        ${reponse}
                    </label>
                `).join('');
            }
            
            questionDiv.innerHTML = `
                <h4>${question.intitule}</h4>
                ${inputHtml}
            `;
            container.appendChild(questionDiv);
        });
        
        document.getElementById('surveyTitle').textContent = sondage.nom;
        showSection(answerSurveySection);
    } catch (error) {
        console.error('Erreur lors du chargement du sondage:', error);
    }
}

async function deleteSurvey(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) return;
    
    try {
        const response = await fetch(`${API_URL}/sondages/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadSurveys();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du sondage:', error);
    }
}

async function editSurvey(id) {
    try {
        const response = await fetch(`${API_URL}/sondages/${id}`);
        const sondage = await response.json();
        
        // Remplir le formulaire de création avec les données du sondage
        const form = document.getElementById('createSurveyForm');
        form.querySelector('input[type="text"]').value = sondage.nom;
        
        const questionsContainer = document.getElementById('questionsContainer');
        questionsContainer.innerHTML = '';
        
        sondage.questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-container';
            questionDiv.innerHTML = `
                <input type="text" placeholder="Intitulé de la question" value="${question.intitule}" required>
                <select required>
                    <option value="ouverte" ${question.type === 'ouverte' ? 'selected' : ''}>Question ouverte</option>
                    <option value="qcm" ${question.type === 'qcm' ? 'selected' : ''}>QCM</option>
                </select>
                <textarea placeholder="Réponses possibles (une par ligne)" style="display: ${question.type === 'qcm' ? 'block' : 'none'};">${question.reponses.join('\n')}</textarea>
                <div class="question-actions">
                    <button type="button" class="remove-question">Supprimer</button>
                </div>
            `;
            
            const select = questionDiv.querySelector('select');
            const textarea = questionDiv.querySelector('textarea');
            select.addEventListener('change', () => {
                textarea.style.display = select.value === 'qcm' ? 'block' : 'none';
            });
            
            questionDiv.querySelector('.remove-question').addEventListener('click', () => {
                questionDiv.remove();
            });
            
            questionsContainer.appendChild(questionDiv);
        });
        
        // Modifier le gestionnaire de soumission du formulaire pour la mise à jour
        const originalSubmitHandler = form.onsubmit;
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nom = form.querySelector('input[type="text"]').value;
            const questions = Array.from(form.querySelectorAll('.question-container')).map(container => {
                const intitule = container.querySelector('input[type="text"]').value;
                const type = container.querySelector('select').value;
                const reponses = type === 'qcm' 
                    ? container.querySelector('textarea').value.split('\n').filter(r => r.trim())
                    : [];
                return { intitule, type, reponses };
            });
            
            try {
                const response = await fetch(`${API_URL}/sondages/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nom, questions })
                });
                
                if (response.ok) {
                    showSection(surveysSection);
                    loadSurveys();
                    form.onsubmit = originalSubmitHandler; // Restaurer le gestionnaire original
                } else {
                    const data = await response.json();
                    showError(form, data.error);
                }
            } catch (error) {
                showError(form, 'Erreur lors de la mise à jour du sondage');
            }
        };
        
        showSection(createSurveySection);
    } catch (error) {
        console.error('Erreur lors du chargement du sondage:', error);
    }
}

async function showResponses(sondageId) {
    try {
        // Récupérer le sondage
        const sondageResponse = await fetch(`${API_URL}/sondages/${sondageId}`);
        const sondage = await sondageResponse.json();
        
        // Récupérer les réponses
        const responsesResponse = await fetch(`${API_URL}/reponses/sondage/${sondageId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const reponses = await responsesResponse.json();
        
        // Afficher le titre
        document.getElementById('responsesTitle').textContent = `Réponses - ${sondage.nom}`;
        
        // Préparer le conteneur des réponses
        const container = document.getElementById('responsesContainer');
        container.innerHTML = '';
        
        if (reponses.length === 0) {
            container.innerHTML = '<p>Aucune réponse pour ce sondage.</p>';
            showSection(responsesSection);
            return;
        }
        
        // Afficher chaque réponse
        reponses.forEach(reponse => {
            const responseCard = document.createElement('div');
            responseCard.className = 'response-card';
            
            // En-tête de la réponse
            const header = document.createElement('div');
            header.className = 'response-header';
            header.innerHTML = `
                <div class="response-user">${reponse.utilisateur_id.nom}</div>
                <div class="response-date">${new Date(reponse.createdAt).toLocaleDateString()}</div>
            `;
            responseCard.appendChild(header);
            
            // Réponses aux questions
            const answersDiv = document.createElement('div');
            answersDiv.className = 'response-answers';
            
            reponse.reponses.forEach(answer => {
                const question = sondage.questions.find(q => q._id === answer.question_id);
                if (question) {
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'response-answer';
                    answerDiv.innerHTML = `
                        <div class="response-question">${question.intitule}</div>
                        <div class="response-value">${Array.isArray(answer.reponse) ? answer.reponse.join(', ') : answer.reponse}</div>
                    `;
                    answersDiv.appendChild(answerDiv);
                }
            });
            
            responseCard.appendChild(answersDiv);
            container.appendChild(responseCard);
        });
        
        // Ajouter les statistiques
        const statsDiv = document.createElement('div');
        statsDiv.className = 'response-stats';
        statsDiv.innerHTML = `
            <h3>Statistiques</h3>
            <div class="stat-item">
                <span class="stat-label">Nombre total de réponses :</span>
                <span class="stat-value">${reponses.length}</span>
            </div>
        `;
        container.appendChild(statsDiv);
        
        showSection(responsesSection);
    } catch (error) {
        console.error('Erreur lors du chargement des réponses:', error);
        alert('Erreur lors du chargement des réponses');
    }
} 