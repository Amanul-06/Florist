import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Download,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';
import { DailyRecord, DailySummary } from '../types';
import { getDailyRecords, deleteDailyRecord } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface DailyBusinessProps {
  onOpenDailyModal: (record?: DailyRecord) => void;
}

export const DailyBusiness: React.FC<DailyBusinessProps> = ({ onOpenDailyModal }) => {
  const { currency, formatCurrency } = useCurrency();
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await getDailyRecords(startDate, endDate);
      setRecords(data.records);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch daily records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [startDate, endDate]);

  const handleDelete = async (id: number, date: string) => {
    if (confirm(`Are you sure you want to delete daily record for ${date}?`)) {
      try {
        await deleteDailyRecord(id);
        loadRecords();
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    window.open(`/api/reports/export/daily?${params.toString()}`, '_blank');
  };

  // Quick preset date ranges
  const setPresetRange = (preset: 'today' | '7days' | 'month' | 'all') => {
    const today = new Date();
    if (preset === 'today') {
      const dStr = today.toISOString().split('T')[0];
      setStartDate(dStr);
      setEndDate(dStr);
    } else if (preset === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.date.includes(searchTerm) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>📅</span> Daily Business Register (CP & SP)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Track daily flower procurement cost price (CP) against daily shop counter sales price (SP)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => onOpenDailyModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record Today's CP/SP
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Days Logged
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 mt-1 block">
              {summary.total_days} days
            </span>
          </div>

          <div className="p-4 bg-white border border-amber-200/70 bg-amber-50/20 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
              Total Cost Price (CP)
            </span>
            <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
              {formatCurrency(summary.total_cp)}
            </span>
            <span className="text-[10px] text-stone-400">Wholesale flower mandi</span>
          </div>

          <div className="p-4 bg-white border border-rose-200/70 bg-rose-50/20 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
              Total Sales Price (SP)
            </span>
            <span className="text-xl font-bold font-mono text-rose-900 mt-1 block">
              {formatCurrency(summary.total_sp)}
            </span>
            <span className="text-[10px] text-stone-400">Counter walk-in sales</span>
          </div>

          <div className="p-4 bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Net Daily Profit
            </span>
            <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
              {formatCurrency(summary.total_profit)}
            </span>
            <span className="text-[10px] text-emerald-700">
              Avg: {formatCurrency(summary.avg_daily_profit)}/day
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Recorded Wastage
            </span>
            <span className="text-xl font-bold font-mono text-stone-800 mt-1 block">
              {formatCurrency(summary.total_wastage)}
            </span>
            <span className="text-[10px] text-stone-400">Discarded wilted stems</span>
          </div>
        </div>
      )}

      {/* Filter and Date Range Control */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Preset Range Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-stone-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setPresetRange('today')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            Today
          </button>
          <button
            onClick={() => setPresetRange('7days')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setPresetRange('month')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            This Month
          </button>
          <button
            onClick={() => setPresetRange('all')}
            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-medium text-stone-700"
          >
            All Time
          </button>
        </div>

        {/* Date Inputs & Search */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
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
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search notes or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg border border-stone-300 text-stone-700 focus:outline-none w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Cost Price (CP)</th>
                <th className="py-3 px-4 text-right">Sales Price (SP)</th>
                <th className="py-3 px-4 text-right">Net Daily Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Wastage</th>
                <th className="py-3 px-4">Notes & Remarks</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No daily business records found for selected period.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const margin = r.sales_price > 0 ? ((r.profit / r.sales_price) * 100).toFixed(1) : '0';
                  const isProfit = r.profit >= 0;

                  return (
                    <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                          <span>{r.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-amber-800">
                        {formatCurrency(r.cost_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-rose-800">
                        {formatCurrency(r.sales_price)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            isProfit
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(r.profit)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-stone-600">
                        {margin}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-500">
                        {r.wastage_amount > 0 ? formatCurrency(r.wastage_amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 max-w-xs truncate" title={r.notes}>
                        {r.notes || <span className="text-stone-300 italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenDailyModal(r)}
                            title="Edit Record"
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.date)}
                            title="Delete Record"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
