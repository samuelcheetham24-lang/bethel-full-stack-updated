const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: someone submits the "Prayer Requests" form.
router.post('/', (req, res) => {
  const { name, contact, message } = req.body;
  if (!name || !contact || !message) {
    return res.status(400).json({ error: 'Name, contact, and message are all required.' });
  }

  const db = readDB();
  const newRequest = {
    id: crypto.randomUUID(),
    name,
    contact,
    message,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  db.prayerRequests.unshift(newRequest);
  writeDB(db);
  res.status(201).json({ message: 'Your request has been received. We are praying with you.', request: newRequest });
});

// Admin: view every request, newest first.
router.get('/', requireAuth, (req, res) => {
  res.json(readDB().prayerRequests);
});

// Admin: mark a request as prayed over / followed up.
router.patch('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const request = db.prayerRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const { status } = req.body;
  const allowed = ['new', 'praying', 'followed-up', 'archived'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }
  request.status = status;
  writeDB(db);
  res.json(request);
});

// Admin: delete a request.
router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.prayerRequests.length;
  db.prayerRequests = db.prayerRequests.filter(r => r.id !== req.params.id);
  if (db.prayerRequests.length === before) return res.status(404).json({ error: 'Request not found.' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
