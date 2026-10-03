import express from 'express';
import { query, run, getOne } from '../db.js';

const router = express.Router();

// GET all labourers
router.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    let sql = 'SELECT * FROM labourers WHERE 1=1';
    const params = [];

    if (active !== undefined && active !== '') {
      sql += ' AND active = ?';
      params.push(active === 'true' || active === '1' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR role LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';
    const labourers = await query(sql, params);
    res.json(labourers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single labourer
router.get('/:id', async (req, res) => {
  try {
    const labourer = await getOne('SELECT * FROM labourers WHERE id = ?', [req.params.id]);
    if (!labourer) return res.status(404).json({ error: 'Labourer not found' });
    res.json(labourer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE labourer
router.post('/', async (req, res) => {
  try {
    const { name, phone, role, default_rate, rate_type, active } = req.body;
    if (!name) return res.status(400).json({ error: 'Labourer name is required' });

    const result = await run(
      `INSERT INTO labourers (name, phone, role, default_rate, rate_type, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        phone || '',
        role || 'Helper',
        parseFloat(default_rate) || 0,
        rate_type || 'daily',
        active !== undefined ? (active ? 1 : 0) : 1
      ]
    );

    const created = await getOne('SELECT * FROM labourers WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE labourer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, role, default_rate, rate_type, active } = req.body;
    if (!name) return res.status(400).json({ error: 'Labourer name is required' });

    const existing = await getOne('SELECT * FROM labourers WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Labourer not found' });

    await run(
      `UPDATE labourers SET
        name = ?,
        phone = ?,
        role = ?,
        default_rate = ?,
        rate_type = ?,
        active = ?
       WHERE id = ?`,
      [
        name.trim(),
        phone !== undefined ? phone : existing.phone,
        role || existing.role,
        parseFloat(default_rate) || 0,
        rate_type || existing.rate_type,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        req.params.id
      ]
    );

    const updated = await getOne('SELECT * FROM labourers WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE labourer
router.delete('/:id', async (req, res) => {
  try {
    const existing = await getOne('SELECT * FROM labourers WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Labourer not found' });

    await run('DELETE FROM labourers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Labourer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
