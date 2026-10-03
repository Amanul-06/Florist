import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Flower2,
  Users2,
  Receipt,
  Calculator,
  AlertCircle
} from 'lucide-react';
import {
  Project,
  Flower,
  Labourer,
  ProjectFlower,
  ProjectLabour,
  ProjectExpense
} from '../types';
import { createProject, updateProject, getFlowers, getLabourers } from '../api';
import { useCurrency } from '../context/CurrencyContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialProject
}) => {
  const { currency, formatCurrency } = useCurrency();

  // Reference lists from database
  const [catalogFlowers, setCatalogFlowers] = useState<Flower[]>([]);
  const [rosterLabourers, setRosterLabourers] = useState<Labourer[]>([]);

  // Project Info State
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState('Wedding');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState<'Quotation' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'>('Quotation');
  const [quotedPrice, setQuotedPrice] = useState<string>('');
  const [advancePaid, setAdvancePaid] = useState<string>('0');
  const [notes, setNotes] = useState('');

  // Line items state
  const [flowers, setFlowers] = useState<ProjectFlower[]>([]);
  const [labour, setLabour] = useState<ProjectLabour[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);

  // Active sub-tab inside modal
  const [activeTab, setActiveTab] = useState<'details' | 'flowers' | 'labour' | 'expenses' | 'pricing'>('details');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load flower catalog and labour roster
  useEffect(() => {
    if (isOpen) {
      getFlowers().then(setCatalogFlowers).catch(console.error);
      getLabourers().then(setRosterLabourers).catch(console.error);
    }
  }, [isOpen]);

  // Populate data when editing or reset when creating
  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name || '');
      setClientName(initialProject.client_name || '');
      setClientPhone(initialProject.client_phone || '');
      setEventDate(initialProject.event_date || new Date().toISOString().split('T')[0]);
      setEventType(initialProject.event_type || 'Wedding');
      setVenue(initialProject.venue || '');
      setStatus(initialProject.status || 'Quotation');
      setQuotedPrice(initialProject.quoted_price?.toString() || '');
      setAdvancePaid((initialProject.advance_paid || 0).toString());
      setNotes(initialProject.notes || '');
      setFlowers(initialProject.flowers || []);
      setLabour(initialProject.labour || []);
      setExpenses(initialProject.expenses || []);
      setActiveTab('details');
    } else {
      setName('');
      setClientName('');
      setClientPhone('');
      setEventDate(new Date().toISOString().split('T')[0]);
      setEventType('Wedding');
      setVenue('');
      setStatus('Quotation');
      setQuotedPrice('');
      setAdvancePaid('0');
      setNotes('');
      setFlowers([]);
      setLabour([]);
      setExpenses([]);
      setActiveTab('details');
    }
    setError(null);
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  // Real-time Financial Calculations
  const totalFlowerCost = flowers.reduce(
    (sum, f) => sum + (parseFloat(String(f.quantity)) || 0) * (parseFloat(String(f.unit_cost)) || 0),
    0
  );
  const totalLabourCost = labour.reduce(
    (sum, l) => sum + (parseFloat(String(l.units_worked)) || 0) * (parseFloat(String(l.rate)) || 0),
    0
  );
  const totalOtherExpenses = expenses.reduce(
    (sum, e) => sum + (parseFloat(String(e.amount)) || 0),
    0
  );

  const totalCost = totalFlowerCost + totalLabourCost + totalOtherExpenses;
  const quote = parseFloat(quotedPrice) || 0;
  const advance = parseFloat(advancePaid) || 0;
  const profit = quote - totalCost;
  const profitMarginPct = quote > 0 ? (profit / quote) * 100 : 0;
  const balanceDue = Math.max(0, quote - advance);

  // Flower row handlers
  const handleAddFlower = () => {
    const defaultFlower = catalogFlowers[0];
    setFlowers([
      ...flowers,
      {
        flower_id: defaultFlower ? defaultFlower.id : null,
        flower_name: defaultFlower ? defaultFlower.name : 'Custom Flower',
        unit: defaultFlower ? defaultFlower.unit : 'stem',
        quantity: 10,
        unit_cost: defaultFlower ? defaultFlower.default_cost_price : 0,
        line_total: defaultFlower ? 10 * defaultFlower.default_cost_price : 0
      }
    ]);
  };

  const handleFlowerChange = (index: number, field: keyof ProjectFlower, value: any) => {
    const updated = [...flowers];
    const row = { ...updated[index], [field]: value };

    if (field === 'flower_id') {
      const selected = catalogFlowers.find((f) => f.id === parseInt(value));
      if (selected) {
        row.flower_name = selected.name;
        row.unit = selected.unit;
        row.unit_cost = selected.default_cost_price;
      }
    }

    const q = parseFloat(String(row.quantity)) || 0;
    const c = parseFloat(String(row.unit_cost)) || 0;
    row.line_total = q * c;

    updated[index] = row;
    setFlowers(updated);
  };

  const handleRemoveFlower = (index: number) => {
    setFlowers(flowers.filter((_, i) => i !== index));
  };

  // Labour row handlers
  const handleAddLabour = () => {
    const defaultLabourer = rosterLabourers[0];
    setLabour([
      ...labour,
      {
        labourer_id: defaultLabourer ? defaultLabourer.id : null,
        labourer_name: defaultLabourer ? defaultLabourer.name : 'Custom Labourer',
        role: defaultLabourer ? defaultLabourer.role : 'Helper',
        units_worked: 1,
        rate: defaultLabourer ? defaultLabourer.default_rate : 800,
        rate_type: defaultLabourer ? defaultLabourer.rate_type : 'daily',
        line_total: defaultLabourer ? defaultLabourer.default_rate : 800
      }
    ]);
  };

  const handleLabourChange = (index: number, field: keyof ProjectLabour, value: any) => {
    const updated = [...labour];
    const row = { ...updated[index], [field]: value };

    if (field === 'labourer_id') {
      const selected = rosterLabourers.find((l) => l.id === parseInt(value));
      if (selected) {
        row.labourer_name = selected.name;
        row.role = selected.role;
        row.rate = selected.default_rate;
        row.rate_type = selected.rate_type;
      }
    }

    const u = parseFloat(String(row.units_worked)) || 0;
    const r = parseFloat(String(row.rate)) || 0;
    row.line_total = u * r;

    updated[index] = row;
    setLabour(updated);
  };

  const handleRemoveLabour = (index: number) => {
    setLabour(labour.filter((_, i) => i !== index));
  };

  // Expense row handlers
  const handleAddExpense = () => {
    setExpenses([
      ...expenses,
      {
        expense_name: 'Transportation & Logistics',
        category: 'Transport',
        amount: 1500,
        notes: ''
      }
    ]);
  };

  const handleExpenseChange = (index: number, field: keyof ProjectExpense, value: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim() || !eventDate) {
      setError('Project name, client name, and event date are required');
      setActiveTab('details');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: name.trim(),
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        event_date: eventDate,
        event_type: eventType,
        venue: venue.trim(),
        status,
        quoted_price: quote,
        advance_paid: advance,
        notes,
        flowers,
        labour,
        expenses
      };

      if (initialProject) {
        await updateProject(initialProject.id, payload);
      } else {
        await createProject(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>💼</span> {initialProject ? `Edit Project: ${initialProject.name}` : 'New Project / Event Costing'}
            </h3>
            <p className="text-xs text-stone-500">
              Calculate flowers, labour, and transport expenses to determine exact profit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 px-6 gap-2 pt-2 shrink-0 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3.5 rounded-t-lg font-medium transition-all ${
              activeTab === 'details'
                ? 'bg-white border-t border-x border-stone-200 text-rose-600 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Event Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flowers')}
            className={`py-2 px-3.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'flowers'
                ? 'bg-white border-t border-x border-stone-200 text-rose-600 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            2. Flowers ({flowers.length})
            <span className="text-xs text-stone-400">[{formatCurrency(totalFlowerCost)}]</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('labour')}
            className={`py-2 px-3.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'labour'
                ? 'bg-white border-t border-x border-stone-200 text-rose-600 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            3. Labour ({labour.length})
            <span className="text-xs text-stone-400">[{formatCurrency(totalLabourCost)}]</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-3.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-white border-t border-x border-stone-200 text-rose-600 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            4. Other Expenses ({expenses.length})
            <span className="text-xs text-stone-400">[{formatCurrency(totalOtherExpenses)}]</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-3.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'bg-white border-t border-x border-stone-200 text-rose-600 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            5. Revenue & Profit
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Project / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Royal Wedding Stage & Mandap Decor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Client Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98111 22233"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Banquet">Banquet Gala</option>
                    <option value="Mandap Decor">Mandap Decor</option>
                    <option value="Stage Backdrop">Stage Backdrop</option>
                    <option value="Housewarming">Housewarming</option>
                    <option value="Funeral">Memorial / Funeral</option>
                    <option value="Custom Order">Custom Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-medium"
                  >
                    <option value="Quotation">Quotation (Draft)</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Venue / Hall / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Orchid Banquet Hall, Rose Ballroom, 2nd Floor"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Project Notes & Floral Design Brief
                </label>
                <textarea
                  rows={3}
                  placeholder="Color themes (e.g. ivory and blush pink), special instructions, arch dimensions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: FLOWERS USED */}
          {activeTab === 'flowers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Flowers Required for Project</h4>
                  <p className="text-xs text-stone-500">
                    Select flower types from your catalog. Default wholesale cost price auto-fills and can be adjusted.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFlower}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Flower
                </button>
              </div>

              {flowers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
                  <Flower2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">No flowers added to this project yet.</p>
                  <button
                    type="button"
                    onClick={handleAddFlower}
                    className="mt-3 text-xs text-rose-600 font-semibold hover:underline"
                  >
                    + Add your first flower
                  </button>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Flower</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 w-24">Quantity</th>
                        <th className="py-2.5 px-3 w-28">Unit Cost ({currency})</th>
                        <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {flowers.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2 px-3">
                            <select
                              value={row.flower_id || ''}
                              onChange={(e) => handleFlowerChange(idx, 'flower_id', e.target.value)}
                              className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                            >
                              <option value="">-- Custom / Select Flower --</option>
                              {catalogFlowers.map((cf) => (
                                <option key={cf.id} value={cf.id}>
                                  {cf.name} ({cf.unit}) - Default: {currency}{cf.default_cost_price}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.unit}
                              onChange={(e) => handleFlowerChange(idx, 'unit', e.target.value)}
                              className="w-16 text-xs py-1 px-2 rounded-lg border border-stone-200 text-stone-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.quantity}
                              onChange={(e) => handleFlowerChange(idx, 'quantity', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.unit_cost}
                              onChange={(e) => handleFlowerChange(idx, 'unit_cost', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-stone-800">
                            {formatCurrency(row.line_total)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFlower(idx)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 border-t border-stone-200 font-semibold text-stone-800">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-stone-500">
                          Total Flower Cost:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700 text-sm">
                          {formatCurrency(totalFlowerCost)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LABOUR */}
          {activeTab === 'labour' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Labour & Decorator Allocation</h4>
                  <p className="text-xs text-stone-500">
                    Assign lead designers, decorators, or helpers with daily or hourly wage rates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLabour}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Labourer
                </button>
              </div>

              {labour.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
                  <Users2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">No labourers assigned to this project yet.</p>
                  <button
                    type="button"
                    onClick={handleAddLabour}
                    className="mt-3 text-xs text-rose-600 font-semibold hover:underline"
                  >
                    + Assign a labourer
                  </button>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Labourer</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 w-28">Units (Days/Hrs)</th>
                        <th className="py-2.5 px-3 w-28">Wage Rate ({currency})</th>
                        <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {labour.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2 px-3">
                            <select
                              value={row.labourer_id || ''}
                              onChange={(e) => handleLabourChange(idx, 'labourer_id', e.target.value)}
                              className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                            >
                              <option value="">-- Custom / Select Labourer --</option>
                              {rosterLabourers.map((rl) => (
                                <option key={rl.id} value={rl.id}>
                                  {rl.name} ({rl.role}) - {currency}{rl.default_rate}/{rl.rate_type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.role}
                              onChange={(e) => handleLabourChange(idx, 'role', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 text-stone-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.units_worked}
                              onChange={(e) => handleLabourChange(idx, 'units_worked', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.rate}
                              onChange={(e) => handleLabourChange(idx, 'rate', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-stone-800">
                            {formatCurrency(row.line_total)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLabour(idx)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 border-t border-stone-200 font-semibold text-stone-800">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-stone-500">
                          Total Labour Cost:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700 text-sm">
                          {formatCurrency(totalLabourCost)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Additional Project Expenses</h4>
                  <p className="text-xs text-stone-500">
                    Include transport delivery, floral foam bricks, arch rentals, vases, or site permits
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
                  <Receipt className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">No other expenses added for this project.</p>
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="mt-3 text-xs text-rose-600 font-semibold hover:underline"
                  >
                    + Add transportation or supplies expense
                  </button>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Expense Name</th>
                        <th className="py-2.5 px-3 w-40">Category</th>
                        <th className="py-2.5 px-3">Notes</th>
                        <th className="py-2.5 px-3 w-32 text-right">Amount ({currency})</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {expenses.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.expense_name}
                              onChange={(e) => handleExpenseChange(idx, 'expense_name', e.target.value)}
                              placeholder="e.g. Mini Truck transport"
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={row.category}
                              onChange={(e) => handleExpenseChange(idx, 'category', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 bg-white"
                            >
                              <option value="Transport">Transport / Delivery</option>
                              <option value="Floral Foam">Floral Foam / Oasis</option>
                              <option value="Vases/Props">Vases / Structure Rental</option>
                              <option value="Fabric">Fabric & Draping</option>
                              <option value="Lighting">Lighting / Candles</option>
                              <option value="Miscellaneous">Miscellaneous</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.notes || ''}
                              onChange={(e) => handleExpenseChange(idx, 'notes', e.target.value)}
                              placeholder="Details..."
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 text-stone-600"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.amount}
                              onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-stone-200 text-right font-mono font-semibold"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveExpense(idx)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 border-t border-stone-200 font-semibold text-stone-800">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-stone-500">
                          Total Other Expenses:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700 text-sm">
                          {formatCurrency(totalOtherExpenses)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRICING & PROFIT */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Cost Summary Pill Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    1. Flowers Cost
                  </span>
                  <span className="text-base font-bold font-mono text-stone-800 mt-1 block">
                    {formatCurrency(totalFlowerCost)}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    2. Labour Cost
                  </span>
                  <span className="text-base font-bold font-mono text-stone-800 mt-1 block">
                    {formatCurrency(totalLabourCost)}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    3. Other Expenses
                  </span>
                  <span className="text-base font-bold font-mono text-stone-800 mt-1 block">
                    {formatCurrency(totalOtherExpenses)}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold block">
                    Total Project Cost
                  </span>
                  <span className="text-base font-bold font-mono text-rose-900 mt-1 block">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              {/* Client Billing Inputs */}
              <div className="bg-stone-50/60 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="text-sm font-bold text-stone-900">Client Revenue & Billing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Quoted Project Price (Total Client Invoice) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        className="w-full text-base font-semibold pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">Contract revenue agreed with client</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Advance Payment Received
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={advancePaid}
                        onChange={(e) => setAdvancePaid(e.target.value)}
                        className="w-full text-base font-semibold pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">Advance deposit received in cash/bank</span>
                  </div>
                </div>
              </div>

              {/* Profit & Margin Display Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  profit >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block">
                    Calculated Net Project Profit
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono">
                      {formatCurrency(profit)}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        profit >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {profitMarginPct.toFixed(1)}% margin
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Revenue ({formatCurrency(quote)}) - Total Cost ({formatCurrency(totalCost)})
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/80 sm:text-right min-w-[180px]">
                  <span className="text-xs text-stone-500 font-medium block">Balance Due from Client</span>
                  <span className="text-lg font-bold font-mono text-amber-900 block">
                    {formatCurrency(balanceDue)}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Payment Status: <strong>{balanceDue <= 0 && quote > 0 ? 'Fully Paid' : advance > 0 ? 'Partially Paid' : 'Pending'}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50 shrink-0">
          <div className="text-xs text-stone-500 font-medium">
            Total Cost: <strong className="text-stone-800">{formatCurrency(totalCost)}</strong>
            {' · '}
            Est. Profit: <strong className={profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatCurrency(profit)}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Project...' : initialProject ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
