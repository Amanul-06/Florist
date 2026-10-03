import express from 'express';
import { query, run, getOne } from '../db.js';

const router = express.Router();

// GET daily records with date filtering & summaries
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;
    let sql = 'SELECT * FROM daily_records WHERE 1=1';
    const params = [];

    if (start_date) {
      sql += ' AND date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY date DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const records = await query(sql, params);

    // Calculate aggregated totals
    let summarySql = `
      SELECT
        COUNT(*) as total_days,
        COALESCE(SUM(cost_price), 0) as total_cp,
        COALESCE(SUM(sales_price), 0) as total_sp,
        COALESCE(SUM(profit), 0) as total_profit,
        COALESCE(SUM(wastage_amount), 0) as total_wastage,
        COALESCE(AVG(profit), 0) as avg_daily_profit
      FROM daily_records WHERE 1=1
    `;
    const summaryParams = [];
    if (start_date) {
      summarySql += ' AND date >= ?';
      summaryParams.push(start_date);
    }
    if (end_date) {
      summarySql += ' AND date <= ?';
      summaryParams.push(end_date);
    }

    const summary = await getOne(summarySql, summaryParams);

    res.json({ records, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single day record by date or id
router.get('/:dateOrId', async (req, res) => {
  try {
    const param = req.params.dateOrId;
    let record;
    if (/^\d{4}-\d{2}-\d{2}$/.test(param)) {
      record = await getOne('SELECT * FROM daily_records WHERE date = ?', [param]);
    } else {
      record = await getOne('SELECT * FROM daily_records WHERE id = ?', [param]);
    }

    if (!record) return res.status(404).json({ error: 'Daily record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE or UPSERT daily record
router.post('/', async (req, res) => {
  try {
    const { date, cost_price, sales_price, wastage_amount, notes } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });

    const cp = parseFloat(cost_price) || 0;
    const sp = parseFloat(sales_price) || 0;
    const wastage = parseFloat(wastage_amount) || 0;
    const profit = sp - cp;

    // Check if record exists for this date
    const existing = await getOne('SELECT id FROM daily_records WHERE date = ?', [date]);

    if (existing) {
      await run(
        `UPDATE daily_records SET
          cost_price = ?,
          sales_price = ?,
          profit = ?,
          wastage_amount = ?,
          notes = ?
         WHERE id = ?`,
        [cp, sp, profit, wastage, notes || '', existing.id]
      );
      const updated = await getOne('SELECT * FROM daily_records WHERE id = ?', [existing.id]);
      return res.json({ message: 'Record updated for date', record: updated });
    }

    const result = await run(
      `INSERT INTO daily_records (date, cost_price, sales_price, profit, wastage_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, cp, sp, profit, wastage, notes || '']
    );

    const created = await getOne('SELECT * FROM daily_records WHERE id = ?', [result.id]);
    res.status(201).json({ message: 'Record created', record: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE daily record
router.put('/:id', async (req, res) => {
  try {
    const { date, cost_price, sales_price, wastage_amount, notes } = req.body;
    const existing = await getOne('SELECT * FROM daily_records WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Daily record not found' });

    const targetDate = date || existing.date;
    const cp = cost_price !== undefined ? parseFloat(cost_price) || 0 : existing.cost_price;
    const sp = sales_price !== undefined ? parseFloat(sales_price) || 0 : existing.sales_price;
    const wastage = wastage_amount !== undefined ? parseFloat(wastage_amount) || 0 : existing.wastage_amount;
    const profit = sp - cp;

    await run(
      `UPDATE daily_records SET
        date = ?,
        cost_price = ?,
        sales_price = ?,
        profit = ?,
        wastage_amount = ?,
        notes = ?
       WHERE id = ?`,
      [targetDate, cp, sp, profit, wastage, notes !== undefined ? notes : existing.notes, req.params.id]
    );

    const updated = await getOne('SELECT * FROM daily_records WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE daily record
router.delete('/:id', async (req, res) => {
  try {
    const existing = await getOne('SELECT * FROM daily_records WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Daily record not found' });

    await run('DELETE FROM daily_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Daily record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
