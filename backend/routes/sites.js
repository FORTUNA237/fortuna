const express = require('express');
const router = express.Router();
const db = require('/config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const verifierToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

router.get('/', (req, res) => {
  db.query('SELECT * FROM sites ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
});

router.post('/', verifierToken, upload.array('images', 5), (req, res) => {
  const { titre, description, categorie, prix, telephone } = req.body;
  const utilisateur_id = req.user.id;
  const images = req.files ? req.files.map(f => f.filename).join(',') : '';
  const telephone_vendeur = telephone || '';

  db.query(
    'INSERT INTO sites (titre, description, categorie, prix, utilisateur_id, images, telephone_vendeur) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titre, description, categorie, prix, utilisateur_id, images, telephone_vendeur],
    (err) => {
      if (err) {
        console.log('Erreur INSERT:', err.message);
        return res.status(500).json({ message: 'Erreur: ' + err.message });
      }
      res.json({ message: 'Site publié avec succès !' });
    }
  );
});

module.exports = router;