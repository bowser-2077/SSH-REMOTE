const { Terminal } = require('xterm'); // Importer xterm.js

// Initialiser un terminal xterm
const terminal = new Terminal();
terminal.open(document.getElementById('terminal')); // Afficher dans l'élément avec l'ID 'terminal'

// Afficher un message de bienvenue dans le terminal
terminal.writeln('Bienvenue dans le terminal SSH!');
terminal.writeln('Tapez "logout" pour quitter.');

// Ajouter une fonctionnalité pour le bouton de déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
    terminal.writeln('Déconnexion...');
    // Ajouter ici la logique de déconnexion SSH si nécessaire
});
