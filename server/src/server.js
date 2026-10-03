import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import flowersRouter from './routes/flowers.js';
import labourersRouter from './routes/labourers.js';
import dailyRouter from './routes/daily.js';
import projectsRouter from './routes/projects.js';
import reportsRouter from './routes/reports.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/flowers', flowersRouter);
app.use('/api/labourers', labourersRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Florist Shop Management API', timestamp: new Date().toISOString() });
});

// Serve frontend build if dist folder exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server after DB init
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🌸 Florist Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
