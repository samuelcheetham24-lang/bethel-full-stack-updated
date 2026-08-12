const express = require('express');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const PAYSTACK_BASE = 'https://api.paystack.co';

// Public: called when someone clicks "Give Now" with an amount and phone number.
router.post('/initialize', async (req, res) => {
  const { amount, phone, note } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Enter a valid giving amount.' });
  }
  if (!phone || !/^\d{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });
  }
  const cleanPhone = String(phone).trim();

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Online giving is not set up yet on this server.' });
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Paystack requires an email to start a transaction, but our
        // giving form only collects a phone number — so we generate a
        // placeholder email from the phone number just to satisfy
        // Paystack. It uses a real-looking domain because Paystack
        // rejects addresses on made-up extensions like ".local". The
        // real phone number is what actually gets saved below, in
        // metadata and in the givings record.
        email: `giver${cleanPhone}@bethelchurchgiving.com`,
        // Paystack expects the smallest currency unit — for GHS that's
        // pesewas, so a ₵100 gift is sent as 10000.
        amount: Math.round(numericAmount * 100),
        currency: 'GHS',
        callback_url: `${req.protocol}://${req.get('host')}/give-callback.html`,
        metadata: { type: 'offering', note: note || '', phone: cleanPhone }
      })
    });

    const data = await response.json();
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Could not start the payment.' });
    }

    res.json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error('Paystack initialize error:', err.message);
    res.status(500).json({ error: 'Could not reach the payment provider. Try again shortly.' });
  }
});

// Public: called by give-callback.html after the person returns from
// Paystack, to confirm whether the gift actually went through.
router.get('/verify/:reference', async (req, res) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Online giving is not set up yet on this server.' });
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(req.params.reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Could not verify this payment.' });
    }

    const tx = data.data;
    const success = tx.status === 'success';

    if (success) {
      const db = readDB();
      const alreadyLogged = db.givings.some(g => g.reference === tx.reference);
      if (!alreadyLogged) {
        db.givings.unshift({
          reference: tx.reference,
          phone: tx.metadata?.phone || '',
          amount: tx.amount / 100,
          currency: tx.currency,
          note: tx.metadata?.note || '',
          givenAt: tx.paid_at || new Date().toISOString()
        });
        writeDB(db);
      }
    }

    res.json({
      success,
      amount: tx.amount / 100,
      currency: tx.currency,
      phone: tx.metadata?.phone || ''
    });
  } catch (err) {
    console.error('Paystack verify error:', err.message);
    res.status(500).json({ error: 'Could not reach the payment provider. Try again shortly.' });
  }
});

// Admin: view every gift that's come in.
router.get('/', requireAuth, (req, res) => {
  res.json(readDB().givings);
});

module.exports = router;
