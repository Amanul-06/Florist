import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  Store,
  Briefcase,
  Layers,
  Settings,
  Save,
  CheckCircle2
} from 'lucide-react';
import { FinancialOverview } from '../types';
import { getReportsOverview } from '../api';
import { useCurrency } from '../context/CurrencyContext';

export const Reports: React.FC = () => {
  const { currency, formatCurrency, shopName, setShopName, setCurrency } = useCurrency();
  const [data, setData] = useState<FinancialOverview | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Settings State
  const [editShopName, setEditShopName] = useState(shopName);
  const [savedSettings, setSavedSettings] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getReportsOverview(startDate, endDate);
      setData(res);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const setPresetRange = (preset: 'month' | '30days' | 'year' | 'all') => {
    const today = new Date();
    if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editShopName.trim()) {
      await setShopName(editShopName.trim());
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-semibold text-stone-500">Generating Financial Reports...</div>
      </div>
    );
  }

  const { combined, daily, projects } = data;

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            Financial Reports & P&L Statement
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Consolidated Profit & Loss accounting combining daily walk-in shop revenue and event contracts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 rounded-xl transition-colors border border-stone-300 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print Statement
          </button>
          <a
            href="/api/reports/export/daily"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" /> Daily CSV
          </a>
          <a
            href="/api/reports/export/projects"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" /> Projects CSV
          </a>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-400 font-medium mr-1">Period:</span>
          <button
            onClick={() => setPresetRange('month')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            This Month
          </button>
          <button
            onClick={() => setPresetRange('30days')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setPresetRange('year')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            This Year
          </button>
          <button
            onClick={() => setPresetRange('all')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            All Historical Data
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-stone-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 bg-stone-50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-stone-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 bg-stone-50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Executive Summary Header (Visible in Print) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs print-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-900">{shopName} - Financial Statement</h3>
            <p className="text-xs text-stone-500">
              Period: {startDate || 'Historical inception'} to {endDate || 'Present'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 block uppercase font-semibold">Net Business Earnings</span>
            <span className="text-2xl font-bold font-mono text-emerald-800">
              {formatCurrency(combined.total_profit)}
            </span>
          </div>
        </div>

        {/* High Level 3-Way Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue Box */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                1. Total Revenue
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold font-mono text-emerald-950 block">
              {formatCurrency(combined.total_revenue)}
            </span>
            <div className="space-y-1 text-xs pt-2 border-t border-emerald-200/40 text-stone-600">
              <div className="flex justify-between">
                <span>Daily Walk-in Sales (SP):</span>
                <span className="font-mono font-medium">{formatCurrency(daily.daily_sp)}</span>
              </div>
              <div className="flex justify-between">
                <span>Project Contracts:</span>
                <span className="font-mono font-medium">{formatCurrency(projects.project_revenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Box */}
          <div className="p-4 bg-rose-50/40 border border-rose-200/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">
                2. Total Expenditure
              </span>
              <TrendingUp className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-2xl font-bold font-mono text-rose-950 block">
              {formatCurrency(combined.total_cost)}
            </span>
            <div className="space-y-1 text-xs pt-2 border-t border-rose-200/40 text-stone-600">
              <div className="flex justify-between">
                <span>Daily Wholesale CP:</span>
                <span className="font-mono font-medium">{formatCurrency(daily.daily_cp)}</span>
              </div>
              <div className="flex justify-between">
                <span>Project Direct Costs:</span>
                <span className="font-mono font-medium">{formatCurrency(projects.project_total_cost)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit Box */}
          <div className="p-4 bg-stone-900 text-white rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-stone-300 tracking-wider">
                3. Net Profit & Margin
              </span>
              <PieChart className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold font-mono text-emerald-400 block">
              {formatCurrency(combined.total_profit)}
            </span>
            <div className="space-y-1 text-xs pt-2 border-t border-stone-800 text-stone-300">
              <div className="flex justify-between">
                <span>Overall Margin:</span>
                <span className="font-bold text-amber-300">{combined.profit_margin_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Receivables Outstanding:</span>
                <span className="font-mono font-medium text-amber-200">{formatCurrency(projects.project_balance_due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Itemized P&L Table */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            Itemized Profit & Loss Statement
          </h4>
          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">Financial Stream / Line Item</th>
                  <th className="py-2.5 px-4 text-right">Revenue</th>
                  <th className="py-2.5 px-4 text-right">Direct Cost</th>
                  <th className="py-2.5 px-4 text-right">Net Profit</th>
                  <th className="py-2.5 px-4 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* Daily Business Row */}
                <tr className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-bold text-stone-800 flex items-center gap-2">
                    <Store className="w-4 h-4 text-rose-500" />
                    <span>Daily Counter & Walk-in Retail ({daily.total_days} days)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-stone-800">
                    {formatCurrency(daily.daily_sp)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-rose-800">
                    {formatCurrency(daily.daily_cp)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                    {formatCurrency(daily.daily_profit)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-stone-600">
                    {daily.daily_sp > 0 ? ((daily.daily_profit / daily.daily_sp) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Projects Stream Row */}
                <tr className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-bold text-stone-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>Event & Wedding Contracts ({projects.total_projects} projects)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-stone-800">
                    {formatCurrency(projects.project_revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-rose-800">
                    {formatCurrency(projects.project_total_cost)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                    {formatCurrency(projects.project_profit)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-stone-600">
                    {projects.project_revenue > 0
                      ? ((projects.project_profit / projects.project_revenue) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>

                {/* Sub-breakdown for Project Costs */}
                <tr className="bg-stone-50/40 text-stone-500">
                  <td className="py-2 px-8">↳ Flowers for Projects</td>
                  <td></td>
                  <td className="py-2 px-4 text-right font-mono">{formatCurrency(projects.project_flower_cost)}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="bg-stone-50/40 text-stone-500">
                  <td className="py-2 px-8">↳ Labour & Decorator Wages</td>
                  <td></td>
                  <td className="py-2 px-4 text-right font-mono">{formatCurrency(projects.project_labour_cost)}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr className="bg-stone-50/40 text-stone-500">
                  <td className="py-2 px-8">↳ Transportation, Foam & Rentals</td>
                  <td></td>
                  <td className="py-2 px-4 text-right font-mono">{formatCurrency(projects.project_other_expenses)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300">
                <tr>
                  <td className="py-3 px-4 uppercase text-[11px] tracking-wider">
                    Total Consolidated Business
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(combined.total_revenue)}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-rose-800">{formatCurrency(combined.total_cost)}</td>
                  <td className="py-3 px-4 text-right font-mono text-base text-emerald-800">{formatCurrency(combined.total_profit)}</td>
                  <td className="py-3 px-4 text-right text-stone-900">{combined.profit_margin_pct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Shop Profile & Preferences Config (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs no-print space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-stone-600" />
          Shop Settings & Preferences
        </h3>
        <p className="text-xs text-stone-500">
          Configure shop name, currency symbol, and report display settings
        </p>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Shop Name (appears on invoices)
            </label>
            <input
              type="text"
              value={editShopName}
              onChange={(e) => setEditShopName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="₹">₹ INR (Indian Rupee)</option>
              <option value="$">$ USD (US Dollar)</option>
              <option value="€">€ EUR (Euro)</option>
              <option value="£">£ GBP (British Pound)</option>
              <option value="AED">AED (UAE Dirham)</option>
              <option value="C$">C$ CAD (Canadian Dollar)</option>
              <option value="A$">A$ AUD (Australian Dollar)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-xs"
            >
              {savedSettings ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
