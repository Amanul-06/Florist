import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../florist.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper for promise-based queries
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Database Initialization & Migrations
export const initDb = async () => {
  await run(`PRAGMA foreign_keys = ON;`);

  // 1. Settings Table
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 2. Flowers Table
  await run(`
    CREATE TABLE IF NOT EXISTS flowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      unit TEXT NOT NULL DEFAULT 'stem',
      default_cost_price REAL NOT NULL DEFAULT 0,
      default_selling_price REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Labourers Table
  await run(`
    CREATE TABLE IF NOT EXISTS labourers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'Helper',
      default_rate REAL NOT NULL DEFAULT 0,
      rate_type TEXT NOT NULL DEFAULT 'daily',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Daily Records Table
  await run(`
    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      cost_price REAL NOT NULL DEFAULT 0,
      sales_price REAL NOT NULL DEFAULT 0,
      profit REAL NOT NULL DEFAULT 0,
      wastage_amount REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Projects Table
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      event_date TEXT NOT NULL,
      event_type TEXT DEFAULT 'Wedding',
      venue TEXT,
      status TEXT NOT NULL DEFAULT 'Quotation',
      total_flower_cost REAL DEFAULT 0,
      total_labour_cost REAL DEFAULT 0,
      total_other_expenses REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      quoted_price REAL DEFAULT 0,
      advance_paid REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      profit REAL DEFAULT 0,
      profit_margin_pct REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Project Flowers Table
  await run(`
    CREATE TABLE IF NOT EXISTS project_flowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      flower_id INTEGER REFERENCES flowers(id) ON DELETE SET NULL,
      flower_name TEXT NOT NULL,
      unit TEXT DEFAULT 'stem',
      quantity REAL NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      line_total REAL NOT NULL DEFAULT 0
    )
  `);

  // 7. Project Labour Table
  await run(`
    CREATE TABLE IF NOT EXISTS project_labour (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      labourer_id INTEGER REFERENCES labourers(id) ON DELETE SET NULL,
      labourer_name TEXT NOT NULL,
      role TEXT,
      units_worked REAL NOT NULL DEFAULT 1,
      rate REAL NOT NULL DEFAULT 0,
      rate_type TEXT DEFAULT 'daily',
      line_total REAL NOT NULL DEFAULT 0
    )
  `);

  // 8. Project Expenses Table
  await run(`
    CREATE TABLE IF NOT EXISTS project_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      expense_name TEXT NOT NULL,
      category TEXT DEFAULT 'Miscellaneous',
      amount REAL NOT NULL DEFAULT 0,
      notes TEXT
    )
  `);

  await seedInitialData();
};

const seedInitialData = async () => {
  // Check if flowers exist
  const existingFlowers = await query(`SELECT COUNT(*) as count FROM flowers`);
  if (existingFlowers[0].count === 0) {
    console.log('Seeding initial flower catalog...');
    const flowers = [
      ['Dutch Red Roses', 'Roses', 'stem', 18.0, 35.0, 'Premium long-stem red roses for bouquets and mandaps'],
      ['White Carnations', 'Carnations', 'stem', 12.0, 25.0, 'Long shelf-life standard white carnations'],
      ['Pink Asiatic Lilies', 'Lilies', 'stem', 45.0, 90.0, 'Fragrant 3-4 bloom stems'],
      ["Baby's Breath (Gypsophila)", 'Fillers', 'bunch', 120.0, 220.0, 'Classic white filler bunch (approx 250g)'],
      ['Yellow Marigold (Genda)', 'Traditional', 'kg', 40.0, 80.0, 'Fresh wholesale garland grade marigolds'],
      ['Blue Dendrobium Orchids', 'Exotics', 'stem', 35.0, 70.0, 'Vibrant tinted blue orchids for stage arches'],
      ['White Chrysanthemums', 'Traditional', 'bunch', 60.0, 110.0, 'Dense flower bunches for backdrop walls'],
      ['Eucalyptus Foliage', 'Foliage', 'bunch', 80.0, 150.0, 'Aromatic silver dollar eucalyptus foliage'],
      ['Jasmine (Mogra)', 'Traditional', 'kg', 180.0, 350.0, 'Highly fragrant premium string mogra'],
      ['Red Anthuriums', 'Exotics', 'stem', 50.0, 95.0, 'Heart-shaped tropical blooms for centerpieces']
    ];

    for (const f of flowers) {
      await run(
        `INSERT INTO flowers (name, category, unit, default_cost_price, default_selling_price, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        f
      );
    }
  }

  // Check if labourers exist
  const existingLabour = await query(`SELECT COUNT(*) as count FROM labourers`);
  if (existingLabour[0].count === 0) {
    console.log('Seeding initial labour roster...');
    const labourers = [
      ['Ramesh Kumar', '9876543210', 'Lead Floral Designer', 1200.0, 'daily', 1],
      ['Suresh Patel', '9876543211', 'Stage & Mandap Decorator', 900.0, 'daily', 1],
      ['Anil Sharma', '9876543212', 'Arrangement Helper', 650.0, 'daily', 1],
      ['Priya Das', '9876543213', 'Bouquet & Table Stylist', 1000.0, 'daily', 1],
      ['Raju Yadav', '9876543214', 'Logistics & Installation', 600.0, 'daily', 1]
    ];

    for (const l of labourers) {
      await run(
        `INSERT INTO labourers (name, phone, role, default_rate, rate_type, active) VALUES (?, ?, ?, ?, ?, ?)`,
        l
      );
    }
  }

  // Check if settings exist
  const existingSettings = await query(`SELECT COUNT(*) as count FROM settings`);
  if (existingSettings[0].count === 0) {
    await run(`INSERT INTO settings (key, value) VALUES ('currency', '₹')`);
    await run(`INSERT INTO settings (key, value) VALUES ('shop_name', 'Bloom & Petal Florists')`);
    await run(`INSERT INTO settings (key, value) VALUES ('phone', '+91 98765 43210')`);
    await run(`INSERT INTO settings (key, value) VALUES ('address', 'Shop #12, Flower Market Road')`);
  }

  // Seed sample daily records for recent 7 days if empty
  const existingDaily = await query(`SELECT COUNT(*) as count FROM daily_records`);
  if (existingDaily[0].count === 0) {
    console.log('Seeding sample daily business records...');
    const today = new Date();
    const records = [
      { offset: 6, cp: 4200, sp: 7800, wastage: 300, notes: 'Mandi purchase: Roses and Marigold' },
      { offset: 5, cp: 3800, sp: 6900, wastage: 200, notes: 'Counter bouquets & temple offerings' },
      { offset: 4, cp: 5100, sp: 9400, wastage: 450, notes: 'Festive weekend surge' },
      { offset: 3, cp: 4500, sp: 8200, wastage: 350, notes: 'Good walk-in sales' },
      { offset: 2, cp: 3600, sp: 6400, wastage: 150, notes: 'Regular weekday sales' },
      { offset: 1, cp: 4900, sp: 9100, wastage: 400, notes: 'High demand for Lilies & Carnations' },
      { offset: 0, cp: 5400, sp: 10200, wastage: 300, notes: "Today's mandi purchase & busy morning" }
    ];

    for (const r of records) {
      const d = new Date(today);
      d.setDate(d.getDate() - r.offset);
      const dateStr = d.toISOString().split('T')[0];
      const profit = r.sp - r.cp;
      await run(
        `INSERT OR IGNORE INTO daily_records (date, cost_price, sales_price, profit, wastage_amount, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [dateStr, r.cp, r.sp, profit, r.wastage, r.notes]
      );
    }
  }

  // Seed sample projects if empty
  const existingProjects = await query(`SELECT COUNT(*) as count FROM projects`);
  if (existingProjects[0].count === 0) {
    console.log('Seeding sample projects...');
    // Project 1: Sharma Wedding
    const p1 = await run(`
      INSERT INTO projects (
        name, client_name, client_phone, event_date, event_type, venue, status,
        total_flower_cost, total_labour_cost, total_other_expenses, total_cost,
        quoted_price, advance_paid, balance_due, profit, profit_margin_pct, payment_status, notes
      ) VALUES (
        'Sharma Royal Wedding Stage & Mandap', 'Rajesh Sharma', '9811122233',
        date('now', '+3 days'), 'Wedding', 'Grand Orchid Banquet Hall, Rose Ballroom', 'Confirmed',
        34200, 9400, 6500, 50100,
        85000, 45000, 40000, 34900, 41.06, 'Partial',
        'Traditional floral mandap with heavy marigold hangings and Dutch rose backdrop arch.'
      )
    `);

    // Flowers for Project 1
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 1, 'Dutch Red Roses', 'stem', 800, 18, 14400]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 5, 'Yellow Marigold (Genda)', 'kg', 120, 40, 4800]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 4, "Baby's Breath (Gypsophila)", 'bunch', 50, 120, 6000]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 6, 'Blue Dendrobium Orchids', 'stem', 200, 35, 7000]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 8, 'Eucalyptus Foliage', 'bunch', 25, 80, 2000]);

    // Labour for Project 1
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 1, 'Ramesh Kumar', 'Lead Floral Designer', 2, 1200, 'daily', 2400]);
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 2, 'Suresh Patel', 'Stage & Mandap Decorator', 3, 900, 'daily', 2700]);
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 3, 'Anil Sharma', 'Arrangement Helper', 4, 650, 'daily', 2600]);
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p1.id, 5, 'Raju Yadav', 'Logistics & Installation', 2.83, 600, 'daily', 1700]);

    // Expenses for Project 1
    await run(`INSERT INTO project_expenses (project_id, expense_name, category, amount, notes) VALUES (?, ?, ?, ?, ?)`,
      [p1.id, 'Mini Truck Delivery & Transport', 'Transport', 2500, '2 round trips from flower market to venue']);
    await run(`INSERT INTO project_expenses (project_id, expense_name, category, amount, notes) VALUES (?, ?, ?, ?, ?)`,
      [p1.id, 'Oasis Floral Foam Bricks (3 boxes)', 'Floral Foam', 2200, 'Wet foam for stage arches']);
    await run(`INSERT INTO project_expenses (project_id, expense_name, category, amount, notes) VALUES (?, ?, ?, ?, ?)`,
      [p1.id, 'Pillars and Drapes Framework Rental', 'Vases/Props', 1800, 'Gold metal arch framework']);

    // Project 2: TechCorp Gala Dinner
    const p2 = await run(`
      INSERT INTO projects (
        name, client_name, client_phone, event_date, event_type, venue, status,
        total_flower_cost, total_labour_cost, total_other_expenses, total_cost,
        quoted_price, advance_paid, balance_due, profit, profit_margin_pct, payment_status, notes
      ) VALUES (
        'TechCorp Annual Awards Dinner Centerpieces', 'Anita Desai', '9822334455',
        date('now', '+8 days'), 'Corporate', 'JW Marriott Grand Ballroom', 'Quotation',
        16800, 3850, 2100, 22750,
        42000, 0, 42000, 19250, 45.83, 'Pending',
        '25 minimalist luxury table centerpieces with Asiatic Lilies and White Chrysanthemums in glass cylinders.'
      )
    `);

    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 3, 'Pink Asiatic Lilies', 'stem', 200, 45, 9000]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 7, 'White Chrysanthemums', 'bunch', 80, 60, 4800]);
    await run(`INSERT INTO project_flowers (project_id, flower_id, flower_name, unit, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 8, 'Eucalyptus Foliage', 'bunch', 37.5, 80, 3000]);

    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 4, 'Priya Das', 'Bouquet & Table Stylist', 2, 1000, 'daily', 2000]);
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 3, 'Anil Sharma', 'Arrangement Helper', 2, 650, 'daily', 1300]);
    await run(`INSERT INTO project_labour (project_id, labourer_id, labourer_name, role, units_worked, rate, rate_type, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p2.id, 5, 'Raju Yadav', 'Logistics & Installation', 1, 600, 'daily', 550]);

    await run(`INSERT INTO project_expenses (project_id, expense_name, category, amount, notes) VALUES (?, ?, ?, ?, ?)`,
      [p2.id, 'Venue Entry & Delivery Van', 'Transport', 1400, 'Late night breakdown pickup included']);
    await run(`INSERT INTO project_expenses (project_id, expense_name, category, amount, notes) VALUES (?, ?, ?, ?, ?)`,
      [p2.id, 'Floating Candle Sets & Ribbons', 'Misc', 700, 'Accent lights for tables']);
  }
};

export default db;
