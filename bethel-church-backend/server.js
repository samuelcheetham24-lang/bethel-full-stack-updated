require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const sermonsRoutes = require('./routes/sermons.routes');
const eventsRoutes = require('./routes/events.routes');
const ministriesRoutes = require('./routes/ministries.routes');
const galleryRoutes = require('./routes/gallery.routes');
const leadershipRoutes = require('./routes/leadership.routes');
const prayerRoutes = require('./routes/prayer.routes');
const giveRoutes = require('./routes/give.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded photos (sermons thumbnails, gallery, leadership headshots)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// The website itself
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sermons', sermonsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/ministries', ministriesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/prayer', prayerRoutes);
app.use('/api/give', giveRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Bethel site + API running at http://localhost:${PORT}`);
});
