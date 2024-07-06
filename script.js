// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6AUBnK_7Vy2ABWI2JMo3ebG_Sljr8XlY",
    authDomain: "cyber-campus-2706f.firebaseapp.com",
    databaseURL: "https://cyber-campus-2706f-default-rtdb.firebaseio.com",
    projectId: "cyber-campus-2706f",
    storageBucket: "cyber-campus-2706f.appspot.com",
    messagingSenderId: "719410601264",
    appId: "1:719410601264:web:44fd2e3757721866303cf5",
    measurementId: "G-CEEFJP5LYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ticket prices mapping
const ticketPrices = {
    "1 Heure": 100,
    "2 Heures": 200,
    "3 Heures": 250,
    "1 Heure Pro": 250,
    "2 Heures Pro": 450,
    "3 Heures Pro": 600,
    "1 Go": 100,
    "5 Go": 400,
    "10 Go": 700,
    "25 Go": 1500,
    "1 Jour (illimité)": 300,
    "3 Jours (illimité)": 600,
    "7 Jours (illimité)": 1200,
    "30 Jours (illimité)": 4000,
    "1 Jour Pro (illimité)": 600,
    "3 Jours Pro (illimité)": 1200,
    "7 Jours Pro (illimité)": 2400,
    "30 Jours Pro (illimité)": 8000
};

// Populate ticket select options
const ticketSelect = document.getElementById('nomTicket');
Object.entries(ticketPrices).forEach(([name, price]) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name} - ${price} F`;
    ticketSelect.appendChild(option);
});


// Fonction pour afficher la fenêtre de sélection des tickets
window.showTicketSelect = function() {
    document.getElementById('ticket-select').style.display = 'block';
}

// Fonction pour fermer la fenêtre de sélection des tickets
window.closeTicketSelect = function() {
    document.getElementById('ticket-select').style.display = 'none';
}

// Attacher les gestionnaires d'événements une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Gestionnaire pour le bouton d'ouverture de la sélection de tickets
    document.querySelector('button[onclick="showTicketSelect()"]').addEventListener('click', showTicketSelect);

    // Gestionnaire pour le bouton de fermeture dans la fenêtre de sélection de tickets
    document.querySelector('#ticket-select button:last-child').addEventListener('click', closeTicketSelect);
});



window.buyTicket = async function() {
    const ticketName = document.getElementById('nomTicket').value;
    if (!ticketName) {
        showNotification("Erreur", "Veuillez sélectionner un ticket.");
        return;
    }

    try {
        const ticketRef = ref(db, 'Tickets/' + ticketName);
        const snapshot = await get(ticketRef);

        if (snapshot.exists()) {
            const ticketData = snapshot.val();
            if (ticketData.utilisateur && ticketData.utilisateur.length > 0) {
                // Récupérer le premier utilisateur disponible
                const user = ticketData.utilisateur[0];
                const password = ticketData.motDePasse[0];
                const price = ticketData.prix[0];
                const paymentLink = ticketData.lienPaiement;

                // Ouvrir le lien de paiement dans une nouvelle fenêtre
                const paymentWindow = window.open(paymentLink, '_blank');

                // Vérifier périodiquement si la fenêtre de paiement est fermée
                const checkPaymentWindow = setInterval(() => {
                    if (paymentWindow.closed) {
                        clearInterval(checkPaymentWindow);
                        // Simuler un paiement réussi (à remplacer par une vérification réelle)
                        handleSuccessfulPayment(ticketName, user, password, price);
                    }
                }, 1000);
            } else {
                showNotification("Erreur", "Aucun ticket disponible pour ce type.");
            }
        } else {
            showNotification("Erreur", "Type de ticket non trouvé.");
        }
    } catch (error) {
        console.error("Erreur lors de l'achat du ticket: ", error);
        showNotification("Erreur", "Une erreur s'est produite lors de l'achat du ticket.");
    }
}

async function handleSuccessfulPayment(ticketName, user, password, price) {
    try {
        // Supprimer le ticket vendu de la base de données
        const ticketRef = ref(db, 'Tickets/' + ticketName);
        const snapshot = await get(ticketRef);
        if (snapshot.exists()) {
            const ticketData = snapshot.val();
            ticketData.utilisateur.shift();
            ticketData.motDePasse.shift();
            ticketData.prix.shift();
            if (ticketData.utilisateur.length === 0) {
                // Si c'était le dernier ticket, supprimer l'entrée
                await remove(ticketRef);
            } else {
                // Sinon, mettre à jour la liste
                await update(ticketRef, ticketData);
            }
        }

        // Afficher le ticket acheté
        showNotification("Ticket acheté", `Nom d'utilisateur: ${user}\nMot de passe: ${password}\nPrix: ${price} F`);
        
        // Stocker temporairement le ticket
        localStorage.setItem('lastTicket', JSON.stringify({user, password, price, ticketName}));
        
        // Afficher l'icône du ticket
        document.getElementById('ticket-icon').style.display = 'block';
    } catch (error) {
        console.error("Erreur lors de la finalisation de l'achat: ", error);
        showNotification("Erreur", "Une erreur s'est produite lors de la finalisation de l'achat.");
    }
}

window.showNotification = function(title, message) {
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    document.getElementById('notification').style.display = 'block';
}

window.hideNotification = function() {
    document.getElementById('notification').style.display = 'none';
}

window.toggleTable = function(tableId) {
    var table = document.getElementById(tableId);
    table.style.display = table.style.display === 'none' ? 'table' : 'none';
}

// Gestionnaire d'événements pour le tableau des points d'accès
document.querySelectorAll('.access-points-table tbody tr').forEach(row => {
    row.addEventListener('click', function() {
        var location = encodeURIComponent(this.cells[0].innerText + ", Cyber Campus");
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${location}`, '_blank');
    });
});

const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
let isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(dark) {
    if (dark) {
        root.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Activer le mode clair');
    } else {
        root.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Activer le mode sombre');
    }
    isDarkTheme = dark;
}

// Initialiser le thème en fonction de la préférence du système
setTheme(isDarkTheme);

themeToggle.addEventListener('click', () => {
    setTheme(!isDarkTheme);
});

// Écouter les changements de préférence de thème du système
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    setTheme(e.matches);
});

// Gérer l'affichage du dernier ticket acheté
const ticketIcon = document.getElementById('ticket-icon');
ticketIcon.addEventListener('click', () => {
    const lastTicket = JSON.parse(localStorage.getItem('lastTicket'));
    if (lastTicket) {
        showNotification("Votre dernier ticket", `Type: ${lastTicket.ticketName}\nNom d'utilisateur: ${lastTicket.user}\nMot de passe: ${lastTicket.password}\nPrix: ${lastTicket.price} F`);
    } else {
        showNotification("Aucun ticket", "Vous n'avez pas encore acheté de ticket.");
    }
});

// Vérifier s'il y a un ticket stocké au chargement de la page
window.addEventListener('load', () => {
    const lastTicket = localStorage.getItem('lastTicket');
    ticketIcon.style.display = lastTicket ? 'block' : 'none';
});

window.closeTicketSelect = function() {
    document.getElementById('ticket-select').style.display = 'none';
}