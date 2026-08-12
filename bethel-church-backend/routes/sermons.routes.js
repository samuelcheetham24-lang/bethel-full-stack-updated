const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readDB, writeDB } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  }
});

// Two kinds of files can come through this route: a small thumbnail
// image, and (optionally) the sermon video itself, for churches that
// want to upload the file directly instead of linking to YouTube/Facebook.
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Thumbnail must be a JPEG, PNG, or WEBP image.'));
  }
  if (file.fieldname === 'videoFile') {
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/3gpp', 'video/x-msvideo'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Video must be an MP4, MOV, or WEBM file.'));
  }
  cb(new Error('Unexpected file field.'));
};

const upload = multer({
  storage,
  fileFilter,
  // Sermon videos are much bigger than photos, so this route gets a
  // generous limit (1GB) instead of the 5MB used for images elsewhere.
  limits: { fileSize: 1024 * 1024 * 1024 }
});

const handleUploads = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]);

router.get('/', (req, res) => {
  res.json(readDB().sermons);
});

router.post('/', requireAuth, handleUploads, (req, res) => {
  const { title, series, speaker, location, videoUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.videoFile?.[0];

  const db = readDB();
  const newSermon = {
    id: crypto.randomUUID(),
    title,
    series: series || '',
    speaker: speaker || '',
    location: location || '',
    // An external link (YouTube/Facebook) and a directly-uploaded file
    // can both be stored — the site prefers the uploaded file if both
    // are present, since that's the video meant to play on-site.
    videoUrl: videoUrl || '',
    videoFileUrl: videoFile ? `/uploads/${videoFile.filename}` : '',
    thumbnailUrl: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : ''
  };
  db.sermons.unshift(newSermon);
  writeDB(db);
  res.status(201).json(newSermon);
});

router.put('/:id', requireAuth, handleUploads, (req, res) => {
  const db = readDB();
  const sermon = db.sermons.find(s => s.id === req.params.id);
  if (!sermon) return res.status(404).json({ error: 'Sermon not found.' });

  const { title, series, speaker, location, videoUrl } = req.body;
  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.videoFile?.[0];

  if (title) sermon.title = title;
  if (series !== undefined) sermon.series = series;
  if (speaker !== undefined) sermon.speaker = speaker;
  if (location !== undefined) sermon.location = location;
  if (videoUrl !== undefined) sermon.videoUrl = videoUrl;
  if (thumbnailFile) sermon.thumbnailUrl = `/uploads/${thumbnailFile.filename}`;
  if (videoFile) sermon.videoFileUrl = `/uploads/${videoFile.filename}`;

  writeDB(db);
  res.json(sermon);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const before = db.sermons.length;
  db.sermons = db.sermons.filter(s => s.id !== req.params.id);
  if (db.sermons.length === before) return res.status(404).json({ error: 'Sermon not found.' });
  writeDB(db);
  res.status(204).send();
});

// Turns multer's upload errors (e.g. "file too large", wrong type)
// into a clean JSON error instead of a raw server crash page.
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Upload failed.' });
  next();
});

module.exports = router;
