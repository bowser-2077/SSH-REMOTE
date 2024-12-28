const express = require('express');
const { Client } = require('ssh2');
const path = require('path');
const session = require('express-session');
const app = express();

// Middleware pour analyser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer les sessions
app.use(session({
  secret: 'your-secret-key', // Vous pouvez changer cette clé
  resave: false,
  saveUninitialized: true
}));

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Créer une instance de SSHClient pour la connexion SSH
let sshClient;

// Route d'accueil pour afficher la page de connexion
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour afficher la page terminal si l'utilisateur est connecté
app.get('/terminal', (req, res) => {
  if (!req.session.sshConnected) {
    return res.redirect('/');  // Rediriger vers la page de connexion si non connecté
  }
  res.sendFile(path.join(__dirname, 'public', 'terminal.html'));
});

// Route pour la connexion SSH
app.post('/login', (req, res) => {
  const { username, password, host } = req.body;

  // Connexion SSH
  sshClient = new Client();
  sshClient.on('ready', () => {
    console.log('Connexion SSH réussie.');

    // Si la connexion SSH est réussie, nous sauvegardons l'état dans la session
    req.session.sshConnected = true;

    res.redirect('/terminal');  // Redirige vers la page terminal après connexion réussie
  }).on('error', (err) => {
    console.log('Erreur SSH:', err);
    res.status(500).send('Échec de la connexion SSH');
  }).connect({
    host,
    port: 22,
    username,
    password
  });
});

// Route pour exécuter des commandes SSH
app.post('/command', (req, res) => {
  const { command } = req.body;

  if (!sshClient) {
    return res.status(400).send('Connexion SSH non établie');
  }

  // Exécution de la commande SSH
  sshClient.exec(command, (err, stream) => {
    if (err) {
      return res.status(500).send('Erreur d\'exécution de la commande');
    }

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    }).on('close', () => {
      res.send({ output });  // Renvoie le résultat de la commande sous forme d'objet JSON
    });
  });
});

// Route pour déconnecter l'utilisateur et fermer la connexion SSH
app.post('/logout', (req, res) => {
  if (sshClient) {
    sshClient.end();
    console.log('Déconnexion SSH');
  }
  req.session.destroy();  // Détruire la session de l'utilisateur
  res.redirect('/');  // Rediriger vers la page de connexion après déconnexion
});

// Lancer le serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
