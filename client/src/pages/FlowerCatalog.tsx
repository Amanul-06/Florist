import React, { useState, useEffect } from 'react';
import { Flower2, Plus, Search, Edit2, Trash2, Tag, Percent } from 'lucide-react';
import { Flower } from '../types';
import { getFlowers, deleteFlower } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface FlowerCatalogProps {
  onOpenFlowerModal: (flower?: Flower) => void;
}

const CATEGORIES = [
  'All',
  'Roses',
  'Carnations',
  'Lilies',
  'Orchids',
  'Traditional',
  'Exotics',
  'Fillers',
  'Foliage'
];

export const FlowerCatalog: React.FC<FlowerCatalogProps> = ({ onOpenFlowerModal }) => {
  const { currency, formatCurrency } = useCurrency();
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFlowers = async () => {
    try {
      setLoading(true);
      const data = await getFlowers(searchTerm, categoryFilter);
      setFlowers(data);
    } catch (err) {
      console.error('Failed to load flowers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlowers();
  }, [categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFlowers();
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete flower "${name}" from the catalog?`)) {
      try {
        await deleteFlower(id);
        loadFlowers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete flower');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-rose-600" />
            Flower Rates & Master Catalog
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Maintain standard wholesale purchase rates (CP) and default retail selling rates (SP) for quick project quoting
          </p>
        </div>

        <button
          onClick={() => onOpenFlowerModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Flower to Catalog
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-stone-200">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search flower by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </form>
      </div>

      {/* Flowers Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-400">Loading flowers...</div>
      ) : flowers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <Flower2 className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-800">No flowers found in catalog</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add your shop's regular flower varieties with their default wholesale and retail rates.
          </p>
          <button
            onClick={() => onOpenFlowerModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Flower
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flowers.map((f) => {
            const unitProfit = f.default_selling_price - f.default_cost_price;
            const markup =
              f.default_cost_price > 0
                ? ((unitProfit / f.default_cost_price) * 100).toFixed(0)
                : '0';

            return (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      {f.category}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      per <strong className="text-stone-800 uppercase">{f.unit}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 line-clamp-1">{f.name}</h3>

                  {f.notes && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2" title={f.notes}>
                      {f.notes}
                    </p>
                  )}

                  {/* Pricing Comparison */}
                  <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                        Cost Price (CP)
                      </span>
                      <span className="text-sm font-mono font-bold text-stone-800 block mt-0.5">
                        {formatCurrency(f.default_cost_price)}
                        <span className="text-[10px] text-stone-400 font-normal">/{f.unit}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                        Selling Price (SP)
                      </span>
                      <span className="text-sm font-mono font-bold text-rose-700 block mt-0.5">
                        {formatCurrency(f.default_selling_price)}
                        <span className="text-[10px] text-stone-400 font-normal">/{f.unit}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{markup}% markup ({formatCurrency(unitProfit)}/{f.unit})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenFlowerModal(f)}
                      className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                      title="Edit Flower"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id, f.name)}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Flower"
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
