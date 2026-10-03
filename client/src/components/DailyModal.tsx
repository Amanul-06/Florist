import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { DailyRecord } from '../types';
import { upsertDailyRecord } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface DailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialRecord?: DailyRecord | null;
}

export const DailyModal: React.FC<DailyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialRecord
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [costPrice, setCostPrice] = useState<string>('');
  const [salesPrice, setSalesPrice] = useState<string>('');
  const [wastageAmount, setWastageAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setCostPrice(initialRecord.cost_price.toString());
      setSalesPrice(initialRecord.sales_price.toString());
      setWastageAmount((initialRecord.wastage_amount || 0).toString());
      setNotes(initialRecord.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCostPrice('');
      setSalesPrice('');
      setWastageAmount('0');
      setNotes('');
    }
    setError(null);
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  const cp = parseFloat(costPrice) || 0;
  const sp = parseFloat(salesPrice) || 0;
  const wastage = parseFloat(wastageAmount) || 0;
  const profit = sp - cp;
  const marginPct = sp > 0 ? (profit / sp) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await upsertDailyRecord({
        date,
        cost_price: cp,
        sales_price: sp,
        wastage_amount: wastage,
        notes
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save daily record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>📅</span> {initialRecord ? 'Edit Daily Business' : 'Record Daily Business'}
            </h3>
            <p className="text-xs text-stone-500">
              Enter your morning wholesale purchases (CP) and daily shop counter sales (SP)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Cost Price (CP) <span className="text-stone-400 font-normal">[{currency}]</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Flower procurement + Mandi cost</span>
            </div>

            {/* Sales Price */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Sales Price (SP) <span className="text-stone-400 font-normal">[{currency}]</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium"
                  required
                />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Total counter revenue collected</span>
            </div>
          </div>

          {/* Spoilage / Wastage */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Estimated Flower Wastage / Spoilage <span className="text-stone-400 font-normal">[{currency}] (Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={wastageAmount}
                onChange={(e) => setWastageAmount(e.target.value)}
                className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Value of discarded/wilted stems</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Daily Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Mandi was crowded, purchased 20 bunches roses; heavy evening bouquet demand"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Live Calculation Preview Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              profit >= 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  profit >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {profit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider block">
                  Calculated Daily Net Profit
                </span>
                <span className="text-xl font-bold font-mono">
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium block opacity-75">Profit Margin</span>
              <span className="text-base font-bold">
                {marginPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Saving...' : initialRecord ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
