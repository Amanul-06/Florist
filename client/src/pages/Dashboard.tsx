import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Store,
  Calendar,
  ArrowUpRight,
  Plus,
  Flower2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { getReportsOverview, getProjects } from '../api';
import { FinancialOverview, Project } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface DashboardProps {
  onOpenDailyModal: () => void;
  onOpenProjectModal: () => void;
  onSelectProject: (project: Project) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenDailyModal,
  onOpenProjectModal,
  onSelectProject,
  onNavigateTab
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [data, setData] = useState<FinancialOverview | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [overview, projRes] = await Promise.all([
        getReportsOverview(),
        getProjects()
      ]);
      setData(overview);
      setRecentProjects(projRes.projects.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-stone-500 tracking-wide">Loading Florist Dashboard...</span>
        </div>
      </div>
    );
  }

  // Today's daily record (latest in trends or from today)
  const todayRecord = data.dailyTrends[data.dailyTrends.length - 1];
  const todayProfit = todayRecord ? todayRecord.profit : 0;
  const todaySales = todayRecord ? todayRecord.sp : 0;
  const todayCost = todayRecord ? todayRecord.cp : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 to-stone-900 text-white p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Shop Executive Summary
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif tracking-tight">Business Overview & Profitability</h2>
          <p className="text-xs text-stone-300 max-w-xl">
            Real-time tracking of wholesale flower purchases, walk-in counter revenue, and high-margin event contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenDailyModal}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Log Daily CP/SP
          </button>
          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Daily Profit */}
        <StatCard
          title="Today's Daily Profit"
          value={formatCurrency(todayProfit)}
          subtitle={`Sales: ${formatCurrency(todaySales)} · CP: ${formatCurrency(todayCost)}`}
          icon={Store}
          variant="emerald"
          badge={{
            text: todayProfit >= 0 ? 'Profitable' : 'Loss',
            type: todayProfit >= 0 ? 'positive' : 'negative'
          }}
        />

        {/* Total Net Profit */}
        <StatCard
          title="Total Net Business Profit"
          value={formatCurrency(data.combined.total_profit)}
          subtitle={`Margin: ${data.combined.profit_margin_pct}% of total revenue`}
          icon={TrendingUp}
          variant="rose"
        />

        {/* Project Pipeline Revenue */}
        <StatCard
          title="Project Pipeline Revenue"
          value={formatCurrency(data.projects.project_revenue)}
          subtitle={`${data.projects.active_projects} Active / Confirmed Events`}
          icon={Briefcase}
          variant="blue"
        />

        {/* Client Receivables */}
        <StatCard
          title="Receivables Due"
          value={formatCurrency(data.projects.project_balance_due)}
          subtitle="Pending balance collection from clients"
          icon={DollarSign}
          variant="amber"
          badge={{
            text: data.projects.project_balance_due > 0 ? 'Pending' : 'Settled',
            type: data.projects.project_balance_due > 0 ? 'neutral' : 'positive'
          }}
        />
      </div>

      {/* Two Column Layout: Daily Trends Visual & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Performance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>📊</span> Daily Business Trend (Cost vs Sales vs Profit)
              </h3>
              <p className="text-xs text-stone-500">
                Visual history of daily flower procurement cost (CP) versus sales price (SP)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('daily')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              View Daily Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Custom SVG Bar/Line Chart */}
          <div className="pt-4">
            {data.dailyTrends.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-stone-400">
                No daily records logged yet.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Bars for recent days */}
                <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-stone-100">
                  {(() => {
                    const maxVal = Math.max(
                      ...data.dailyTrends.map((d) => Math.max(d.sp, d.cp, d.profit, 1000))
                    );

                    return data.dailyTrends.slice(-7).map((d, i) => {
                      const spHeight = Math.max(8, (d.sp / maxVal) * 180);
                      const cpHeight = Math.max(6, (d.cp / maxVal) * 180);
                      const profitHeight = Math.max(4, (Math.max(0, d.profit) / maxVal) * 180);

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-stone-900 text-white rounded px-1.5 py-0.5 absolute -translate-y-12 pointer-events-none z-10 whitespace-nowrap shadow-md">
                            SP: {formatCurrency(d.sp)} | CP: {formatCurrency(d.cp)} | Profit: {formatCurrency(d.profit)}
                          </div>

                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            {/* Sales Bar */}
                            <div
                              style={{ height: `${spHeight}px` }}
                              className="w-3 sm:w-4 bg-rose-400 hover:bg-rose-500 rounded-t-sm transition-all"
                              title={`Sales: ${formatCurrency(d.sp)}`}
                            />
                            {/* Cost Bar */}
                            <div
                              style={{ height: `${cpHeight}px` }}
                              className="w-3 sm:w-4 bg-amber-400 hover:bg-amber-500 rounded-t-sm transition-all"
                              title={`Cost: ${formatCurrency(d.cp)}`}
                            />
                            {/* Profit Bar */}
                            <div
                              style={{ height: `${profitHeight}px` }}
                              className="w-3 sm:w-4 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all"
                              title={`Profit: ${formatCurrency(d.profit)}`}
                            />
                          </div>

                          <span className="text-[10px] font-medium text-stone-500 truncate w-full text-center">
                            {d.date.slice(5)}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-rose-400"></span>
                    <span>Sales Price (SP)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-400"></span>
                    <span>Cost Price (CP)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                    <span>Net Profit (SP - CP)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Flowers Consumed & Quick Stats */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-rose-600" />
                Top Flowers by Project Spend
              </h3>
              <button
                onClick={() => onNavigateTab('flowers')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Rates Master →
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Highest utilized fresh flower varieties in confirmed wedding and event contracts
            </p>

            <div className="space-y-3">
              {(data.topFlowers || []).slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">{f.flower_name}</span>
                    <span className="text-[11px] text-stone-500">
                      {f.total_qty} {f.unit} used
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-700">
                    {formatCurrency(f.total_spend)}
                  </span>
                </div>
              ))}
              {(!data.topFlowers || data.topFlowers.length === 0) && (
                <div className="text-center py-6 text-xs text-stone-400">
                  No flower usage recorded yet in projects.
                </div>
              )}
            </div>
          </div>

          {/* Labour summary pill */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/70 rounded-xl text-xs flex items-center justify-between">
            <span className="text-stone-700 font-medium">Total Labour Paid:</span>
            <span className="font-bold font-mono text-rose-900">
              {formatCurrency(data.projects.project_labour_cost)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>💼</span> Active & Recent Projects
            </h3>
            <p className="text-xs text-stone-500">
              Individual wedding decor and event contracts with calculated flower/labour profit
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            All Projects ({data.projects.total_projects}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Project & Client</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quoted Price</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">{p.name}</span>
                    <span className="text-[11px] text-stone-500">
                      Client: {p.client_name} · {p.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{p.event_date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                        p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : p.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                    {formatCurrency(p.quoted_price)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone-600">
                    {formatCurrency(p.total_cost)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(p.profit)}
                    <span className="text-[10px] text-stone-400 block font-normal">
                      {p.profit_margin_pct?.toFixed(0)}% margin
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={p.balance_due > 0 ? 'text-amber-700 font-semibold' : 'text-stone-400'}>
                      {formatCurrency(p.balance_due)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(p);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-200"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
