import express from 'express';
import { query, run, getOne } from '../db.js';

const router = express.Router();

// GET all flowers with optional search and category filter
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT * FROM flowers WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY name ASC';
    const flowers = await query(sql, params);
    res.json(flowers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single flower
router.get('/:id', async (req, res) => {
  try {
    const flower = await getOne('SELECT * FROM flowers WHERE id = ?', [req.params.id]);
    if (!flower) return res.status(404).json({ error: 'Flower not found' });
    res.json(flower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE flower
router.post('/', async (req, res) => {
  try {
    const { name, category, unit, default_cost_price, default_selling_price, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Flower name is required' });

    const result = await run(
      `INSERT INTO flowers (name, category, unit, default_cost_price, default_selling_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category || 'General',
        unit || 'stem',
        parseFloat(default_cost_price) || 0,
        parseFloat(default_selling_price) || 0,
        notes || ''
      ]
    );

    const created = await getOne('SELECT * FROM flowers WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE flower
router.put('/:id', async (req, res) => {
  try {
    const { name, category, unit, default_cost_price, default_selling_price, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Flower name is required' });

    const existing = await getOne('SELECT * FROM flowers WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Flower not found' });

    await run(
      `UPDATE flowers SET
        name = ?,
        category = ?,
        unit = ?,
        default_cost_price = ?,
        default_selling_price = ?,
        notes = ?
       WHERE id = ?`,
      [
        name.trim(),
        category || existing.category,
        unit || existing.unit,
        parseFloat(default_cost_price) || 0,
        parseFloat(default_selling_price) || 0,
        notes !== undefined ? notes : existing.notes,
        req.params.id
      ]
    );

    const updated = await getOne('SELECT * FROM flowers WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE flower
router.delete('/:id', async (req, res) => {
  try {
    const existing = await getOne('SELECT * FROM flowers WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Flower not found' });

    await run('DELETE FROM flowers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Flower deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
