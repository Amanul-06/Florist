import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Flower } from '../types';
import { createFlower, updateFlower } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface FlowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialFlower?: Flower | null;
}

const CATEGORIES = [
  'Roses',
  'Carnations',
  'Lilies',
  'Orchids',
  'Traditional',
  'Exotics',
  'Fillers',
  'Foliage',
  'General'
];

const UNITS = ['stem', 'bunch', 'kg', 'box', 'piece', 'bundle'];

export const FlowerModal: React.FC<FlowerModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialFlower
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Roses');
  const [unit, setUnit] = useState('stem');
  const [defaultCostPrice, setDefaultCostPrice] = useState('');
  const [defaultSellingPrice, setDefaultSellingPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFlower) {
      setName(initialFlower.name);
      setCategory(initialFlower.category || 'General');
      setUnit(initialFlower.unit || 'stem');
      setDefaultCostPrice(initialFlower.default_cost_price.toString());
      setDefaultSellingPrice(initialFlower.default_selling_price.toString());
      setNotes(initialFlower.notes || '');
    } else {
      setName('');
      setCategory('Roses');
      setUnit('stem');
      setDefaultCostPrice('');
      setDefaultSellingPrice('');
      setNotes('');
    }
    setError(null);
  }, [initialFlower, isOpen]);

  if (!isOpen) return null;

  const cp = parseFloat(defaultCostPrice) || 0;
  const sp = parseFloat(defaultSellingPrice) || 0;
  const markup = cp > 0 ? (((sp - cp) / cp) * 100).toFixed(0) : '0';
  const unitProfit = sp - cp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Flower name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: name.trim(),
        category,
        unit,
        default_cost_price: cp,
        default_selling_price: sp,
        notes
      };

      if (initialFlower) {
        await updateFlower(initialFlower.id, payload);
      } else {
        await createFlower(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save flower');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>🌹</span> {initialFlower ? 'Edit Flower Rate' : 'Add New Flower to Catalog'}
            </h3>
            <p className="text-xs text-stone-500">
              Set standard wholesale cost price and default retail selling price
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Flower Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dutch Red Roses, Pink Asiatic Lilies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u.toUpperCase()} ({u})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Default Cost (CP) / {unit}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={defaultCostPrice}
                  onChange={(e) => setDefaultCostPrice(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Default Retail (SP) / {unit}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={defaultSellingPrice}
                  onChange={(e) => setDefaultSellingPrice(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Unit Margin Indicator */}
          {cp > 0 && sp > 0 && (
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                Unit Profit: <strong className="text-emerald-700">{formatCurrency(unitProfit)}</strong> per {unit}
              </span>
              <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                +{markup}% markup
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Care</label>
            <input
              type="text"
              placeholder="e.g. Needs cold water hydration, lasts 5-7 days"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialFlower ? 'Update Flower' : 'Add Flower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
