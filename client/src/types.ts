export interface Flower {
  id: number;
  name: string;
  category: string;
  unit: string;
  default_cost_price: number;
  default_selling_price: number;
  notes: string;
  created_at?: string;
}

export interface Labourer {
  id: number;
  name: string;
  phone: string;
  role: string;
  default_rate: number;
  rate_type: 'daily' | 'hourly';
  active: number | boolean;
  created_at?: string;
}

export interface DailyRecord {
  id: number;
  date: string;
  cost_price: number;
  sales_price: number;
  profit: number;
  wastage_amount: number;
  notes: string;
  created_at?: string;
}

export interface DailySummary {
  total_days: number;
  total_cp: number;
  total_sp: number;
  total_profit: number;
  total_wastage: number;
  avg_daily_profit: number;
}

export interface ProjectFlower {
  id?: number;
  project_id?: number;
  flower_id?: number | null;
  flower_name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface ProjectLabour {
  id?: number;
  project_id?: number;
  labourer_id?: number | null;
  labourer_name: string;
  role: string;
  units_worked: number;
  rate: number;
  rate_type: string;
  line_total: number;
}

export interface ProjectExpense {
  id?: number;
  project_id?: number;
  expense_name: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface Project {
  id: number;
  name: string;
  client_name: string;
  client_phone: string;
  event_date: string;
  event_type: string;
  venue: string;
  status: 'Quotation' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  total_flower_cost: number;
  total_labour_cost: number;
  total_other_expenses: number;
  total_cost: number;
  quoted_price: number;
  advance_paid: number;
  balance_due: number;
  profit: number;
  profit_margin_pct: number;
  payment_status: 'Pending' | 'Partial' | 'Paid';
  notes: string;
  created_at?: string;
  flowers?: ProjectFlower[];
  labour?: ProjectLabour[];
  expenses?: ProjectExpense[];
}

export interface ProjectSummary {
  total_projects: number;
  confirmed: number;
  completed: number;
  total_revenue: number;
  total_profit: number;
  total_receivables: number;
}

export interface FinancialOverview {
  combined: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    profit_margin_pct: number;
  };
  daily: {
    total_days: number;
    daily_cp: number;
    daily_sp: number;
    daily_profit: number;
    daily_wastage: number;
  };
  projects: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    project_revenue: number;
    project_flower_cost: number;
    project_labour_cost: number;
    project_other_expenses: number;
    project_total_cost: number;
    project_profit: number;
    project_advance_collected: number;
    project_balance_due: number;
  };
  dailyTrends: Array<{
    date: string;
    cp: number;
    sp: number;
    profit: number;
    wastage: number;
  }>;
  topFlowers: Array<{
    flower_name: string;
    unit: string;
    total_qty: number;
    total_spend: number;
  }>;
  labourDistribution: Array<{
    role: string;
    total_units: number;
    total_paid: number;
  }>;
}

export interface AppSettings {
  currency: string;
  shop_name: string;
  phone: string;
  address: string;
  [key: string]: string;
}
