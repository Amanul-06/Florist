import React, { useState, useEffect } from 'react';
import { Users2, Plus, Search, Edit2, Trash2, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Labourer } from '../types';
import { getLabourers, deleteLabourer } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface LabourersProps {
  onOpenLabourModal: (labourer?: Labourer) => void;
}

export const Labourers: React.FC<LabourersProps> = ({ onOpenLabourModal }) => {
  const { currency, formatCurrency } = useCurrency();
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLabourers = async () => {
    try {
      setLoading(true);
      const data = await getLabourers(searchTerm, activeFilter);
      setLabourers(data);
    } catch (err) {
      console.error('Failed to load labourers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabourers();
  }, [activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLabourers();
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the labour roster?`)) {
      try {
        await deleteLabourer(id);
        loadLabourers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete labourer');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            Labour Roster & Wage Rates Master
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Maintain skilled floral designers, stage decorators, and helpers with standard daily or hourly wage rates
          </p>
        </div>

        <button
          onClick={() => onOpenLabourModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Labourer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-stone-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === ''
                ? 'bg-rose-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Labourers
          </button>
          <button
            onClick={() => setActiveFilter('true')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'true'
                ? 'bg-rose-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('false')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'false'
                ? 'bg-rose-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Inactive
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, role, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </form>
      </div>

      {/* Labourers Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-400">Loading labour roster...</div>
      ) : labourers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <Users2 className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-800">No labourers found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add team members, freelance floral designers, and helpers along with their standard pay rates.
          </p>
          <button
            onClick={() => onOpenLabourModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Labourer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labourers.map((l) => {
            const isActive = Boolean(l.active);

            return (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Pay basis: <strong className="text-stone-700 capitalize">{l.rate_type}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">{l.name}</h3>

                  <p className="text-xs font-semibold text-rose-600 mt-0.5">
                    {l.role}
                  </p>

                  {l.phone && (
                    <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{l.phone}</span>
                    </p>
                  )}

                  {/* Wage Rate Card */}
                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">Default Wage:</span>
                    <span className="text-base font-bold font-mono text-stone-900">
                      {formatCurrency(l.default_rate)}
                      <span className="text-xs text-stone-400 font-normal">/{l.rate_type}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">
                    ID: #{l.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenLabourModal(l)}
                      className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                      title="Edit Labourer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id, l.name)}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Labourer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
