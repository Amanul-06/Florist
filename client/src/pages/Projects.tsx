import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
  Clock,
  Printer,
  Edit2,
  Trash2
} from 'lucide-react';
import { Project, ProjectSummary } from '../types';
import { getProjects, deleteProject } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface ProjectsProps {
  onOpenProjectModal: (project?: Project) => void;
  onSelectProject: (project: Project) => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  onOpenProjectModal,
  onSelectProject
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects(statusFilter, searchTerm);
      setProjects(data.projects);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await deleteProject(id);
        loadProjects();
      } catch (err: any) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'All') params.append('status', statusFilter);
    if (searchTerm) params.append('search', searchTerm);
    window.open(`/api/reports/export/projects?${params.toString()}`, '_blank');
  };

  const statusTabs = [
    { id: 'All', label: 'All Projects' },
    { id: 'Quotation', label: 'Quotations' },
    { id: 'Confirmed', label: 'Confirmed' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>💼</span> Event & Decor Projects Management
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Cost estimation for weddings, stage decor, and events by itemizing flowers, labour, and transport
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
            onClick={() => onOpenProjectModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Active / Confirmed
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 mt-1 block">
              {summary.confirmed} Projects
            </span>
            <span className="text-[10px] text-stone-400">{summary.completed} Completed</span>
          </div>

          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Total Contract Revenue
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 mt-1 block">
              {formatCurrency(summary.total_revenue)}
            </span>
            <span className="text-[10px] text-stone-400">Total client billing</span>
          </div>

          <div className="p-4 bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Project Profit
            </span>
            <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
              {formatCurrency(summary.total_profit)}
            </span>
            <span className="text-[10px] text-emerald-700">
              Avg margin ~
              {summary.total_revenue > 0
                ? ((summary.total_profit / summary.total_revenue) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>

          <div className="p-4 bg-white border border-amber-200 bg-amber-50/20 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Pending Receivables
            </span>
            <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
              {formatCurrency(summary.total_receivables)}
            </span>
            <span className="text-[10px] text-stone-400">Client balance due</span>
          </div>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-stone-200">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search client, title, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </form>
      </div>

      {/* Projects List View */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-800">No projects found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Create a new wedding decor, stage setup, or event project to start itemizing flowers and labour costs.
          </p>
          <button
            onClick={() => onOpenProjectModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const isCompleted = p.status === 'Completed';
            const isConfirmed = p.status === 'Confirmed' || p.status === 'In Progress';

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md hover:border-rose-300 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Date Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isConfirmed
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : p.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {p.status}
                    </span>

                    <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {p.event_date}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {p.name}
                  </h3>

                  {/* Client & Type */}
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-700">{p.client_name}</span>
                    <span>·</span>
                    <span className="text-rose-600 font-semibold">{p.event_type}</span>
                  </p>

                  {p.venue && (
                    <p className="text-[11px] text-stone-400 mt-1 truncate" title={p.venue}>
                      📍 {p.venue}
                    </p>
                  )}

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">Quote</span>
                      <span className="text-xs font-mono font-bold text-stone-900 block mt-0.5">
                        {formatCurrency(p.quoted_price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">Cost</span>
                      <span className="text-xs font-mono font-medium text-rose-700 block mt-0.5">
                        {formatCurrency(p.total_cost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">Profit</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 block mt-0.5">
                        {formatCurrency(p.profit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Details */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500">
                    Margin: <strong className="text-stone-800">{p.profit_margin_pct?.toFixed(0)}%</strong>
                    {p.balance_due > 0 && (
                      <span className="text-amber-700 ml-1 font-semibold">
                        (Due: {formatCurrency(p.balance_due)})
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProjectModal(p);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id, p.name);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-rose-600 flex items-center group-hover:translate-x-0.5 transition-transform ml-1">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
