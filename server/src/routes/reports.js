import express from 'express';
import { query, getOne } from '../db.js';

const router = express.Router();

// GET comprehensive financial summary & analytics
router.get('/overview', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Daily records summary in range
    let dailySql = `
      SELECT
        COUNT(*) as total_days,
        COALESCE(SUM(cost_price), 0) as daily_cp,
        COALESCE(SUM(sales_price), 0) as daily_sp,
        COALESCE(SUM(profit), 0) as daily_profit,
        COALESCE(SUM(wastage_amount), 0) as daily_wastage
      FROM daily_records WHERE 1=1
    `;
    const dailyParams = [];
    if (start_date) {
      dailySql += ' AND date >= ?';
      dailyParams.push(start_date);
    }
    if (end_date) {
      dailySql += ' AND date <= ?';
      dailyParams.push(end_date);
    }
    const dailySummary = await getOne(dailySql, dailyParams);

    // Projects summary in range
    let projSql = `
      SELECT
        COUNT(*) as total_projects,
        COALESCE(SUM(CASE WHEN status IN ('Confirmed', 'In Progress') THEN 1 ELSE 0 END), 0) as active_projects,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_projects,
        COALESCE(SUM(quoted_price), 0) as project_revenue,
        COALESCE(SUM(total_flower_cost), 0) as project_flower_cost,
        COALESCE(SUM(total_labour_cost), 0) as project_labour_cost,
        COALESCE(SUM(total_other_expenses), 0) as project_other_expenses,
        COALESCE(SUM(total_cost), 0) as project_total_cost,
        COALESCE(SUM(profit), 0) as project_profit,
        COALESCE(SUM(advance_paid), 0) as project_advance_collected,
        COALESCE(SUM(balance_due), 0) as project_balance_due
      FROM projects WHERE 1=1
    `;
    const projParams = [];
    if (start_date) {
      projSql += ' AND event_date >= ?';
      projParams.push(start_date);
    }
    if (end_date) {
      projSql += ' AND event_date <= ?';
      projParams.push(end_date);
    }
    const projectSummary = await getOne(projSql, projParams);

    // Combined Totals
    const total_revenue = (dailySummary.daily_sp || 0) + (projectSummary.project_revenue || 0);
    const total_cost = (dailySummary.daily_cp || 0) + (projectSummary.project_total_cost || 0);
    const total_profit = (dailySummary.daily_profit || 0) + (projectSummary.project_profit || 0);
    const profit_margin_pct = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

    // Daily trend data for charts (last 14 days or filtered range)
    let trendSql = `
      SELECT date, cost_price as cp, sales_price as sp, profit, wastage_amount as wastage
      FROM daily_records WHERE 1=1
    `;
    const trendParams = [];
    if (start_date) {
      trendSql += ' AND date >= ?';
      trendParams.push(start_date);
    }
    if (end_date) {
      trendSql += ' AND date <= ?';
      trendParams.push(end_date);
    }
    trendSql += ' ORDER BY date ASC LIMIT 30';
    const dailyTrends = await query(trendSql, trendParams);

    // Top flowers consumed in projects
    const topFlowers = await query(`
      SELECT
        flower_name,
        unit,
        SUM(quantity) as total_qty,
        SUM(line_total) as total_spend
      FROM project_flowers
      GROUP BY flower_name, unit
      ORDER BY total_spend DESC
      LIMIT 6
    `);

    // Labour distribution
    const labourDistribution = await query(`
      SELECT
        role,
        SUM(units_worked) as total_units,
        SUM(line_total) as total_paid
      FROM project_labour
      GROUP BY role
      ORDER BY total_paid DESC
    `);

    res.json({
      combined: {
        total_revenue,
        total_cost,
        total_profit,
        profit_margin_pct: parseFloat(profit_margin_pct.toFixed(2))
      },
      daily: dailySummary,
      projects: projectSummary,
      dailyTrends,
      topFlowers,
      labourDistribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export for Daily Records
router.get('/export/daily', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let sql = 'SELECT date, cost_price, sales_price, profit, wastage_amount, notes FROM daily_records WHERE 1=1';
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
    const records = await query(sql, params);

    const headers = ['Date', 'Cost Price (CP)', 'Sales Price (SP)', 'Profit', 'Wastage', 'Notes'];
    const rows = records.map(r => [
      r.date,
      r.cost_price,
      r.sales_price,
      r.profit,
      r.wastage_amount,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="daily_records.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export for Projects
router.get('/export/projects', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let sql = `
      SELECT
        id, name, client_name, client_phone, event_date, event_type, venue, status,
        total_flower_cost, total_labour_cost, total_other_expenses, total_cost,
        quoted_price, advance_paid, balance_due, profit, profit_margin_pct, payment_status, notes
      FROM projects WHERE 1=1
    `;
    const params = [];
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

    const headers = [
      'Project ID', 'Project Name', 'Client Name', 'Phone', 'Event Date', 'Event Type', 'Venue', 'Status',
      'Flower Cost', 'Labour Cost', 'Other Expenses', 'Total Cost', 'Quoted Revenue',
      'Advance Paid', 'Balance Due', 'Net Profit', 'Profit Margin %', 'Payment Status', 'Notes'
    ];

    const rows = projects.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.client_name || '').replace(/"/g, '""')}"`,
      `"${(p.client_phone || '').replace(/"/g, '""')}"`,
      p.event_date,
      p.event_type,
      `"${(p.venue || '').replace(/"/g, '""')}"`,
      p.status,
      p.total_flower_cost,
      p.total_labour_cost,
      p.total_other_expenses,
      p.total_cost,
      p.quoted_price,
      p.advance_paid,
      p.balance_due,
      p.profit,
      p.profit_margin_pct,
      p.payment_status,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="projects_report.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
