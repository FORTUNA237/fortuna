const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Inscription
router.post('/inscription', async (req, res) => {
  const { nom, email, password, telephone } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.promise().query(
      'INSERT INTO utilisateurs (nom, email, password, telephone) VALUES (?, ?, ?, ?)',
      [nom, email, hash, telephone]
    );
    res.json({ message: 'Compte créé avec succès !' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.promise().query(
      'INSERT INTO utilisateurs (nom, email, password, telephone) VALUES (?, ?, ?, ?)',
      [nom, email, hash, telephone]
    );
    res.json({ message: 'Compte créé avec succès !' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion
router.post('/connexion', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, nom: user.nom });
  });
});

module.exports = router;