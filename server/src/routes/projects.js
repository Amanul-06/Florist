import express from 'express';
import { query, run, getOne } from '../db.js';

const router = express.Router();

// Helper to recalculate project totals
const computeProjectFinancials = (flowers = [], labour = [], expenses = [], quoted_price = 0, advance_paid = 0) => {
  const total_flower_cost = flowers.reduce((sum, f) => sum + ((parseFloat(f.quantity) || 0) * (parseFloat(f.unit_cost) || 0)), 0);
  const total_labour_cost = labour.reduce((sum, l) => sum + ((parseFloat(l.units_worked) || 0) * (parseFloat(l.rate) || 0)), 0);
  const total_other_expenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const total_cost = total_flower_cost + total_labour_cost + total_other_expenses;
  const quote = parseFloat(quoted_price) || 0;
  const advance = parseFloat(advance_paid) || 0;
  const profit = quote - total_cost;
  const profit_margin_pct = quote > 0 ? (profit / quote) * 100 : 0;
  const balance_due = Math.max(0, quote - advance);

  let payment_status = 'Pending';
  if (advance >= quote && quote > 0) {
    payment_status = 'Paid';
  } else if (advance > 0) {
    payment_status = 'Partial';
  }

  return {
    total_flower_cost,
    total_labour_cost,
    total_other_expenses,
    total_cost,
    quoted_price: quote,
    advance_paid: advance,
    balance_due,
    profit,
    profit_margin_pct,
    payment_status
  };
};

// GET all projects with summary info
router.get('/', async (req, res) => {
  try {
    const { status, search, start_date, end_date } = req.query;
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR client_name LIKE ? OR client_phone LIKE ? OR venue LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (start_date) {
      sql += ' AND event_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND event_date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY event_date DESC';
    const projects = await query(sql, params);

    // Summary counts & financials
    const summary = {
      total_projects: projects.length,
      confirmed: projects.filter(p => p.status === 'Confirmed' || p.status === 'In Progress').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      total_revenue: projects.reduce((s, p) => s + (p.quoted_price || 0), 0),
      total_profit: projects.reduce((s, p) => s + (p.profit || 0), 0),
      total_receivables: projects.reduce((s, p) => s + (p.balance_due || 0), 0)
    };

    res.json({ projects, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project with flowers, labour, and expenses
router.get('/:id', async (req, res) => {
  try {
    const project = await getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const flowers = await query('SELECT * FROM project_flowers WHERE project_id = ? ORDER BY id ASC', [project.id]);
    const labour = await query('SELECT * FROM project_labour WHERE project_id = ? ORDER BY id ASC', [project.id]);
    const expenses = await query('SELECT * FROM project_expenses WHERE project_id = ? ORDER BY id ASC', [project.id]);

    res.json({
      ...project,
      flowers,
      labour,
      expenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new project
router.post('/', async (req, res) => {
  try {
    const {
      name,
      client_name,
      client_phone,
      event_date,
      event_type,
      venue,
      status,
      quoted_price,
      advance_paid,
      notes,
      flowers = [],
      labour = [],
      expenses = []
    } = req.body;

    if (!name || !client_name || !event_date) {
      return res.status(400).json({ error: 'Project name, client name, and event date are required' });
    }

    const financials = computeProjectFinancials(flowers, labour, expenses, quoted_price, advance_paid);

    const projectResult = await run(
      `INSERT INTO projects (
        name, client_name, client_phone, event_date, event_type, venue, status,
        total_flower_cost, total_labour_cost, total_other_expenses, total_cost,
        quoted_price, advance_paid, balance_due, profit, profit_margin_pct,
        payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        client_name.trim(),
        client_phone || '',
        event_date,
        event_type || 'Wedding',
        venue || '',
        status || 'Quotation',
        financials.total_flower_cost,
        financials.total_labour_cost,
        financials.total_other_expenses,
        financials.total_cost,
        financials.quoted_price,
        financials.advance_paid,
        financials.balance_due,
        financials.profit,
        financials.profit_margin_pct,
        financials.payment_status,
        notes || ''
      ]
    );

    const projectId = projectResult.id;

    // Insert Flowers
    for (const f of flowers) {
      const q = parseFloat(f.quantity) || 0;
      const c = parseFloat(f.unit_cost) || 0;
      await run(
        `INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [projectId, f.flower_id || null, f.flower_name || 'Flower', f.unit || 'stem', q, c, q * c]
      );
    }

    // Insert Labour
    for (const l of labour) {
      const units = parseFloat(l.units_worked) || 1;
      const rate = parseFloat(l.rate) || 0;
      await run(
        `INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, l.labourer_id || null, l.labourer_name || 'Labourer', l.role || 'Helper', units, rate, l.rate_type || 'daily', units * rate]
      );
    }

    // Insert Expenses
    for (const e of expenses) {
      const amount = parseFloat(e.amount) || 0;
      await run(
        `INSERT INTO project_expenses (project_id, expense_name, category, amount, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [projectId, e.expense_name || 'Expense', e.category || 'Miscellaneous', amount, e.notes || '']
      );
    }

    const created = await getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    const insertedFlowers = await query('SELECT * FROM project_flowers WHERE project_id = ?', [projectId]);
    const insertedLabour = await query('SELECT * FROM project_labour WHERE project_id = ?', [projectId]);
    const insertedExpenses = await query('SELECT * FROM project_expenses WHERE project_id = ?', [projectId]);

    res.status(201).json({
      ...created,
      flowers: insertedFlowers,
      labour: insertedLabour,
      expenses: insertedExpenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE project
router.put('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const existing = await getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const {
      name,
      client_name,
      client_phone,
      event_date,
      event_type,
      venue,
      status,
      quoted_price,
      advance_paid,
      notes,
      flowers,
      labour,
      expenses
    } = req.body;

    // If flowers/labour/expenses are provided, recompute financials
    const updatedFlowers = flowers !== undefined ? flowers : await query('SELECT * FROM project_flowers WHERE project_id = ?', [projectId]);
    const updatedLabour = labour !== undefined ? labour : await query('SELECT * FROM project_labour WHERE project_id = ?', [projectId]);
    const updatedExpenses = expenses !== undefined ? expenses : await query('SELECT * FROM project_expenses WHERE project_id = ?', [projectId]);

    const targetQuoted = quoted_price !== undefined ? quoted_price : existing.quoted_price;
    const targetAdvance = advance_paid !== undefined ? advance_paid : existing.advance_paid;

    const financials = computeProjectFinancials(updatedFlowers, updatedLabour, updatedExpenses, targetQuoted, targetAdvance);

    await run(
      `UPDATE projects SET
        name = ?,
        client_name = ?,
        client_phone = ?,
        event_date = ?,
        event_type = ?,
        venue = ?,
        status = ?,
        total_flower_cost = ?,
        total_labour_cost = ?,
        total_other_expenses = ?,
        total_cost = ?,
        quoted_price = ?,
        advance_paid = ?,
        balance_due = ?,
        profit = ?,
        profit_margin_pct = ?,
        payment_status = ?,
        notes = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        client_name !== undefined ? client_name.trim() : existing.client_name,
        client_phone !== undefined ? client_phone : existing.client_phone,
        event_date !== undefined ? event_date : existing.event_date,
        event_type !== undefined ? event_type : existing.event_type,
        venue !== undefined ? venue : existing.venue,
        status !== undefined ? status : existing.status,
        financials.total_flower_cost,
        financials.total_labour_cost,
        financials.total_other_expenses,
        financials.total_cost,
        financials.quoted_price,
        financials.advance_paid,
        financials.balance_due,
        financials.profit,
        financials.profit_margin_pct,
        financials.payment_status,
        notes !== undefined ? notes : existing.notes,
        projectId
      ]
    );

    // If line items were supplied in request, replace them
    if (flowers !== undefined) {
      await run('DELETE FROM project_flowers WHERE project_id = ?', [projectId]);
      for (const f of flowers) {
        const q = parseFloat(f.quantity) || 0;
        const c = parseFloat(f.unit_cost) || 0;
        await run(
          `INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [projectId, f.flower_id || null, f.flower_name || 'Flower', f.unit || 'stem', q, c, q * c]
        );
      }
    }

    if (labour !== undefined) {
      await run('DELETE FROM project_labour WHERE project_id = ?', [projectId]);
      for (const l of labour) {
        const units = parseFloat(l.units_worked) || 1;
        const rate = parseFloat(l.rate) || 0;
        await run(
          `INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [projectId, l.labourer_id || null, l.labourer_name || 'Labourer', l.role || 'Helper', units, rate, l.rate_type || 'daily', units * rate]
        );
      }
    }

    if (expenses !== undefined) {
      await run('DELETE FROM project_expenses WHERE project_id = ?', [projectId]);
      for (const e of expenses) {
        const amount = parseFloat(e.amount) || 0;
        await run(
          `INSERT INTO project_expenses (project_id, expense_name, category, amount, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [projectId, e.expense_name || 'Expense', e.category || 'Miscellaneous', amount, e.notes || '']
        );
      }
    }

    const updated = await getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    const currentFlowers = await query('SELECT * FROM project_flowers WHERE project_id = ?', [projectId]);
    const currentLabour = await query('SELECT * FROM project_labour WHERE project_id = ?', [projectId]);
    const currentExpenses = await query('SELECT * FROM project_expenses WHERE project_id = ?', [projectId]);

    res.json({
      ...updated,
      flowers: currentFlowers,
      labour: currentLabour,
      expenses: currentExpenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const existing = await getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    await run('DELETE FROM project_flowers WHERE project_id = ?', [req.params.id]);
    await run('DELETE FROM project_labour WHERE project_id = ?', [req.params.id]);
    await run('DELETE FROM project_expenses WHERE project_id = ?', [req.params.id]);
    await run('DELETE FROM projects WHERE id = ?', [req.params.id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
