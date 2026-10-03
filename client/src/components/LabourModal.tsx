import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Labourer } from '../types';
import { createLabourer, updateLabourer } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface LabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialLabourer?: Labourer | null;
}

const ROLES = [
  'Lead Floral Designer',
  'Stage & Mandap Decorator',
  'Bouquet & Table Stylist',
  'Arrangement Helper',
  'Logistics & Installation',
  'Driver & Delivery'
];

export const LabourModal: React.FC<LabourModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialLabourer
}) => {
  const { currency } = useCurrency();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Arrangement Helper');
  const [defaultRate, setDefaultRate] = useState('');
  const [rateType, setRateType] = useState<'daily' | 'hourly'>('daily');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLabourer) {
      setName(initialLabourer.name);
      setPhone(initialLabourer.phone || '');
      setRole(initialLabourer.role || 'Arrangement Helper');
      setDefaultRate(initialLabourer.default_rate.toString());
      setRateType(initialLabourer.rate_type || 'daily');
      setActive(Boolean(initialLabourer.active));
    } else {
      setName('');
      setPhone('');
      setRole('Arrangement Helper');
      setDefaultRate('800');
      setRateType('daily');
      setActive(true);
    }
    setError(null);
  }, [initialLabourer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Labourer name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        role,
        default_rate: parseFloat(defaultRate) || 0,
        rate_type: rateType,
        active
      };

      if (initialLabourer) {
        await updateLabourer(initialLabourer.id, payload);
      } else {
        await createLabourer(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save labourer');
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
              <span>👷</span> {initialLabourer ? 'Edit Labourer' : 'Add Labourer to Roster'}
            </h3>
            <p className="text-xs text-stone-500">
              Manage skilled florists, decorators, and helper daily wages
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">Labourer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Role / Specialization</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Default Wage Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Rate Basis</label>
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value as 'daily' | 'hourly')}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="daily">Per Day (Shift)</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>Active (Available for project assignments)</span>
            </label>
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
              {loading ? 'Saving...' : initialLabourer ? 'Update Labourer' : 'Add Labourer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
