import {
  Flower,
  Labourer,
  DailyRecord,
  DailySummary,
  Project,
  ProjectSummary,
  FinancialOverview,
  AppSettings
} from './types';

const API_BASE = '/api';

// Flowers API
export const getFlowers = async (search = '', category = ''): Promise<Flower[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  const res = await fetch(`${API_BASE}/flowers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch flowers');
  return res.json();
};

export const createFlower = async (flower: Partial<Flower>): Promise<Flower> => {
  const res = await fetch(`${API_BASE}/flowers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flower)
  });
  if (!res.ok) throw new Error('Failed to create flower');
  return res.json();
};

export const updateFlower = async (id: number, flower: Partial<Flower>): Promise<Flower> => {
  const res = await fetch(`${API_BASE}/flowers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flower)
  });
  if (!res.ok) throw new Error('Failed to update flower');
  return res.json();
};

export const deleteFlower = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/flowers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete flower');
};

// Labourers API
export const getLabourers = async (search = '', active = ''): Promise<Labourer[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (active !== '') params.append('active', active);
  const res = await fetch(`${API_BASE}/labourers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch labourers');
  return res.json();
};

export const createLabourer = async (labourer: Partial<Labourer>): Promise<Labourer> => {
  const res = await fetch(`${API_BASE}/labourers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(labourer)
  });
  if (!res.ok) throw new Error('Failed to create labourer');
  return res.json();
};

export const updateLabourer = async (id: number, labourer: Partial<Labourer>): Promise<Labourer> => {
  const res = await fetch(`${API_BASE}/labourers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(labourer)
  });
  if (!res.ok) throw new Error('Failed to update labourer');
  return res.json();
};

export const deleteLabourer = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/labourers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete labourer');
};

// Daily Business API
export const getDailyRecords = async (
  start_date = '',
  end_date = '',
  limit = ''
): Promise<{ records: DailyRecord[]; summary: DailySummary }> => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  if (limit) params.append('limit', limit);
  const res = await fetch(`${API_BASE}/daily?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch daily records');
  return res.json();
};

export const upsertDailyRecord = async (
  record: Partial<DailyRecord>
): Promise<{ message: string; record: DailyRecord }> => {
  const res = await fetch(`${API_BASE}/daily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error('Failed to save daily record');
  return res.json();
};

export const deleteDailyRecord = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/daily/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete daily record');
};

// Projects API
export const getProjects = async (
  status = '',
  search = '',
  start_date = '',
  end_date = ''
): Promise<{ projects: Project[]; summary: ProjectSummary }> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  const res = await fetch(`${API_BASE}/projects?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export const getProjectById = async (id: number): Promise<Project> => {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project details');
  return res.json();
};

export const createProject = async (project: any): Promise<Project> => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};

export const updateProject = async (id: number, project: any): Promise<Project> => {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
};

export const deleteProject = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
};

// Reports API
export const getReportsOverview = async (start_date = '', end_date = ''): Promise<FinancialOverview> => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  const res = await fetch(`${API_BASE}/reports/overview?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch financial reports');
  return res.json();
};

// Settings API
export const getSettings = async (): Promise<AppSettings> => {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
};
