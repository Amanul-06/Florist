import express from 'express';
import { query, run } from '../db.js';

const router = express.Router();

// GET all settings
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT key, value FROM settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE settings
router.post('/', async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await run(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, String(value)]
      );
    }
    const rows = await query('SELECT key, value FROM settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
