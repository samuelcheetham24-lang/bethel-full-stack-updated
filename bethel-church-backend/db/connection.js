// A very small "database": everything lives in one JSON file on disk
// (data/store.json). No database software to install — just files.
// readDB() loads it, writeDB() saves it back.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'store.json');

function defaultData() {
  return {
    admins: [],
    sermons: [
      { id: 'sermon-1', title: 'The God Who Sees', series: 'Walking in Purpose', speaker: 'Senior Pastor', location: 'Sowutuom', videoUrl: '', thumbnailUrl: '' },
      { id: 'sermon-2', title: 'Faith in the In-Between', series: 'Anchored', speaker: 'Senior Pastor', location: 'Sowutuom', videoUrl: '', thumbnailUrl: '' },
      { id: 'sermon-3', title: 'Grace for the Starting Over', series: 'New Beginnings', speaker: 'Branch Pastor', location: 'Nsakina', videoUrl: '', thumbnailUrl: '' }
    ],
    events: [
      { id: 'event-1', title: 'Sunday Worship Service', description: '8:30 – 11:30 AM, all welcome', date: '2026-09-14', location: 'Sowutuom' },
      { id: 'event-2', title: 'Midweek Prayer & Bible Study', description: '6:30 – 7:30 PM — open to all', date: '2026-09-17', location: 'Both Campuses' },
      { id: 'event-3', title: 'Youth Connect Night', description: 'Games, worship, and real conversation', date: '2026-09-21', location: 'Sowutuom' },
      { id: 'event-4', title: 'Nsakina Family Day', description: 'A celebration for our Nsakina branch', date: '2026-09-28', location: 'Nsakina' }
    ],
    ministries: [
      { id: 'children', name: "Children's Ministry", description: 'A safe, joyful space for kids to discover faith through story, song, and play.', icon: '👶' },
      { id: 'youth', name: 'Youth Ministry', description: 'Real talk, real friendships, and a faith that holds up outside of church walls.', icon: '🔥' },
      { id: 'worship', name: 'Worship & Creative Arts', description: 'Music, media, and the arts — offered as worship, open to every skill level.', icon: '🎶' },
      { id: 'men', name: "Men's Fellowship", description: 'Brotherhood, accountability, and honest conversation about faith and life.', icon: '🤝' },
      { id: 'women', name: "Women's Fellowship", description: 'A community of women encouraging each other through every season.', icon: '🌿' },
      { id: 'outreach', name: 'Outreach & Missions', description: 'Taking what happens here out into Sowutuom, Nsakina, and beyond.', icon: '🌍' }
    ],
    gallery: [
      { id: 'g1', caption: 'Sunday Worship', imageUrl: '' },
      { id: 'g2', caption: 'Youth Camp', imageUrl: '' },
      { id: 'g3', caption: 'Baptism Sunday', imageUrl: '' },
      { id: 'g4', caption: 'Nsakina Dedication', imageUrl: '' },
      { id: 'g5', caption: 'Christmas Service', imageUrl: '' },
      { id: 'g6', caption: 'Community Outreach', imageUrl: '' }
    ],
    leadership: [
      { id: 'senior-pastor-1', name: 'Rev. Abraham Laryea', role: 'Senior Pastor · Sowutuom', bio: 'Leading Bethel with a heart for the searching and a passion for genuine community.', photoUrl: '/img/pastor-abraham-laryea.jpg' },
      { id: 'senior-pastor-2', name: 'Rev. Stella Laryea', role: 'Senior Pastor · Sowutuom', bio: 'Leading Bethel with a heart for the searching and a passion for genuine community.', photoUrl: '/img/pastor-stella-laryea.jpg' },
      { id: 'branch-pastor', name: 'Evang. Victoria Cheetham', role: 'Branch Pastor · Nsakina', bio: 'Shepherding the Nsakina family with warmth, and a deep love for this community.', photoUrl: '/img/evangelist-victoria-cheetham.jpg' }
    ],
    prayerRequests: [],
    givings: [],
    settings: {
      email: 'betheldivinemysterychurch@gmail.com',
      phone: '+233249382270',
      phoneDisplay: '024 938 2270',
      hours: { sunday: '8:30 – 11:30 AM', wednesday: '6:30 – 7:30 PM', friday: '6:30 – 7:30 PM' },
      campuses: [
        { name: 'Sowutuom', address: 'Sowutuom, Accra' },
        { name: 'Nsakina', address: 'Nsakina, Accra' }
      ],
      social: {
        facebook: 'https://www.facebook.com/profile.php?id=100064570636504',
        instagram: 'https://www.instagram.com/betheldivinemysterychurch?igsh=MTk5c3U0Y3pvdzN0bg==',
        tiktok: 'https://vt.tiktok.com/ZS4ftwu7L/',
        youtube: 'https://youtube.com/@betheldivinemysteryint.chu5102?si=auu5n5DFL8vquMZ7'
      },
      footerTagline: 'Every mystery welcome. Every question honored.'
    }
  };
}

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData(), null, 2));
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  // If this store.json was created before a field existed (an older
  // version of the site), fill it in automatically instead of
  // erroring or losing existing data.
  let changed = false;
  const defaults = defaultData();
  for (const key of Object.keys(defaults)) {
    if (!(key in data)) {
      data[key] = defaults[key];
      changed = true;
    }
  }
  if (changed) writeDB(data);

  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
