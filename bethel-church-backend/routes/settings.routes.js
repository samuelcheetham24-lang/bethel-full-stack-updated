const express = require('express');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: the site reads these on every page load to fill in contact
// info, service hours, campus addresses, and social media links.
router.get('/', (req, res) => {
  res.json(readDB().settings);
});

// Admin only: update any subset of settings. Nested objects (hours,
// social) are merged key-by-key so updating one field doesn't wipe
// the others out.
router.put('/', requireAuth, (req, res) => {
  const db = readDB();
  const { email, phone, phoneDisplay, hours, campuses, social, footerTagline } = req.body;

  if (email !== undefined) db.settings.email = email;
  if (phone !== undefined) db.settings.phone = phone;
  if (phoneDisplay !== undefined) db.settings.phoneDisplay = phoneDisplay;
  if (footerTagline !== undefined) db.settings.footerTagline = footerTagline;
  if (hours) db.settings.hours = { ...db.settings.hours, ...hours };
  if (social) db.settings.social = { ...db.settings.social, ...social };
  if (Array.isArray(campuses)) db.settings.campuses = campuses;

  writeDB(db);
  res.json(db.settings);
});

module.exports = router;
