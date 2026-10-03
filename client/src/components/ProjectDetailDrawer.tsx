import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  User,
  Flower2,
  Users2,
  Receipt,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { Project } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { InvoiceModal } from './InvoiceModal';

interface ProjectDetailDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!isOpen || !project) return null;

  const statusColors = {
    Quotation: 'bg-stone-100 text-stone-700 border-stone-300',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-stone-200 bg-stone-50 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    statusColors[project.status] || 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  {project.event_type}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    project.payment_status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : project.payment_status === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  Payment: {project.payment_status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">{project.name}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsInvoiceOpen(true)}
                title="Print Quote / Invoice"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                title="Edit Project"
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
                title="Delete Project"
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Meta Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-700">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Event Date</span>
                  <span className="font-semibold">{project.event_date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <User className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Client Name</span>
                  <span className="font-semibold">{project.client_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-semibold">{project.client_phone || 'N/A'}</span>
                </div>
              </div>
              {project.venue && (
                <div className="col-span-full flex items-start gap-2 text-stone-700 pt-2 border-t border-stone-200/60 mt-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Venue</span>
                    <span className="font-medium">{project.venue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Performance Summary */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-5 rounded-2xl shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                Profit & Loss Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <div>
                  <span className="text-stone-400 text-xs block">Quoted Revenue</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(project.quoted_price)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">Total Direct Cost</span>
                  <span className="text-xl font-bold font-mono text-rose-300">
                    {formatCurrency(project.total_cost)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">Net Project Profit</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {formatCurrency(project.profit)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">Profit Margin</span>
                  <span className="text-xl font-bold font-mono text-amber-300">
                    {project.profit_margin_pct?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Advance & Balance */}
              <div className="mt-4 pt-3 border-t border-stone-700 flex items-center justify-between text-xs">
                <span className="text-stone-300">
                  Advance Paid: <strong>{formatCurrency(project.advance_paid)}</strong>
                </span>
                <span className="text-amber-300 font-semibold">
                  Balance Due: {formatCurrency(project.balance_due)}
                </span>
              </div>
            </div>

            {/* Flowers Table */}
            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flower2 className="w-3.5 h-3.5 text-rose-600" />
                Flowers Used ({project.flowers?.length || 0})
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-3">Flower Name</th>
                      <th className="py-2 px-3 text-right">Quantity</th>
                      <th className="py-2 px-3 text-right">Cost Rate</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(project.flowers || []).map((f, i) => (
                      <tr key={i} className="hover:bg-stone-50/50">
                        <td className="py-2 px-3 font-medium text-stone-800">{f.flower_name}</td>
                        <td className="py-2 px-3 text-right text-stone-600">{f.quantity} {f.unit}</td>
                        <td className="py-2 px-3 text-right text-stone-600">{formatCurrency(f.unit_cost)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-stone-900">
                          {formatCurrency(f.line_total)}
                        </td>
                      </tr>
                    ))}
                    {(!project.flowers || project.flowers.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-stone-400">No flowers recorded</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-stone-50 font-semibold border-t border-stone-200">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right text-stone-500">Total Flowers:</td>
                      <td className="py-2 px-3 text-right font-mono text-stone-900">{formatCurrency(project.total_flower_cost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Labour Table */}
            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-blue-600" />
                Labour Allocated ({project.labour?.length || 0})
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-3">Labourer Name</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3 text-right">Units Worked</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(project.labour || []).map((l, i) => (
                      <tr key={i} className="hover:bg-stone-50/50">
                        <td className="py-2 px-3 font-medium text-stone-800">{l.labourer_name}</td>
                        <td className="py-2 px-3 text-stone-500">{l.role}</td>
                        <td className="py-2 px-3 text-right text-stone-600">{l.units_worked} {l.rate_type}</td>
                        <td className="py-2 px-3 text-right text-stone-600">{formatCurrency(l.rate)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-stone-900">
                          {formatCurrency(l.line_total)}
                        </td>
                      </tr>
                    ))}
                    {(!project.labour || project.labour.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-3 text-center text-stone-400">No labour recorded</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-stone-50 font-semibold border-t border-stone-200">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-stone-500">Total Labour:</td>
                      <td className="py-2 px-3 text-right font-mono text-stone-900">{formatCurrency(project.total_labour_cost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Other Expenses Table */}
            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                Other Direct Expenses ({project.expenses?.length || 0})
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-3">Expense Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Notes</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(project.expenses || []).map((e, i) => (
                      <tr key={i} className="hover:bg-stone-50/50">
                        <td className="py-2 px-3 font-medium text-stone-800">{e.expense_name}</td>
                        <td className="py-2 px-3 text-stone-500">{e.category}</td>
                        <td className="py-2 px-3 text-stone-500">{e.notes || '-'}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-stone-900">
                          {formatCurrency(e.amount)}
                        </td>
                      </tr>
                    ))}
                    {(!project.expenses || project.expenses.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-stone-400">No other expenses recorded</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-stone-50 font-semibold border-t border-stone-200">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right text-stone-500">Total Other Expenses:</td>
                      <td className="py-2 px-3 text-right font-mono text-stone-900">{formatCurrency(project.total_other_expenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="font-semibold text-stone-700 block mb-1">Notes:</span>
                <p className="text-stone-600 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50 shrink-0">
            <span className="text-xs text-stone-500">
              Project ID: #{project.id}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold bg-stone-800 hover:bg-stone-900 text-white rounded-xl transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          project={project}
        />
      )}
    </>
  );
};
