import React from 'react';
import { X, Printer } from 'lucide-react';
import { Project } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { currency, formatCurrency, shopName } = useCurrency();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Controls - Hidden during Print */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-stone-50 no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-700">Project Quotation & Invoice</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
              #{project.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print-only font-sans">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
                  {shopName}
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1">Boutique Floral Styling & Event Decor</p>
              <p className="text-xs text-stone-500">Flower Market Road · Phone: +91 98765 43210</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-stone-800 tracking-tight uppercase">
                {project.status === 'Quotation' ? 'Project Quotation' : 'Project Invoice'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">Invoice #: INV-{project.id.toString().padStart(4, '0')}</p>
              <p className="text-xs text-stone-500">Date: {new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Client & Event Info */}
          <div className="grid grid-cols-2 gap-8 my-6 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Client Details:
              </span>
              <p className="font-bold text-stone-800 text-sm">{project.client_name}</p>
              <p className="text-stone-600 mt-0.5">Phone: {project.client_phone || 'N/A'}</p>
              <p className="text-stone-600 mt-0.5">Event Type: {project.event_type}</p>
            </div>
            <div>
              <span className="text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                Event Schedule:
              </span>
              <p className="font-bold text-stone-800 text-sm">Date: {project.event_date}</p>
              <p className="text-stone-600 mt-0.5">Venue: {project.venue || 'As agreed'}</p>
              <p className="text-stone-600 mt-0.5">Project: {project.name}</p>
            </div>
          </div>

          {/* Itemized Floral & Decor Scope */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Floral & Decor Specifications
            </h3>
            <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(project.flowers || []).map((f, i) => (
                  <tr key={`f-${i}`}>
                    <td className="py-2 px-3 font-medium text-stone-800">{f.flower_name}</td>
                    <td className="py-2 px-3 text-stone-500">Fresh Flower Spec</td>
                    <td className="py-2 px-3 text-right font-medium text-stone-700">{f.quantity} {f.unit}</td>
                  </tr>
                ))}
                {(project.expenses || []).map((e, i) => (
                  <tr key={`e-${i}`}>
                    <td className="py-2 px-3 font-medium text-stone-800">{e.expense_name}</td>
                    <td className="py-2 px-3 text-stone-500">{e.category}</td>
                    <td className="py-2 px-3 text-right font-medium text-stone-700">1 Service / Package</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-stone-600">
                <span>Agreed Contract Total:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">{formatCurrency(project.quoted_price)}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-600 border-t border-stone-200">
                <span>Advance Paid:</span>
                <span className="font-semibold text-emerald-700 font-mono">{formatCurrency(project.advance_paid)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-stone-800 text-sm font-bold text-stone-900">
                <span>Net Balance Due:</span>
                <span className="font-mono text-base text-rose-700">{formatCurrency(project.balance_due)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {project.notes && (
            <div className="mt-6 p-3 bg-stone-50 rounded-lg text-xs text-stone-600">
              <strong className="block text-stone-700 mb-0.5">Special Instructions:</strong>
              {project.notes}
            </div>
          )}

          {/* Signature Block */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-stone-200 text-xs">
            <div>
              <p className="text-stone-400 mb-10">Client Acceptance Signature:</p>
              <div className="border-b border-stone-400 w-48"></div>
              <p className="text-stone-600 mt-1">{project.client_name}</p>
            </div>
            <div className="text-right">
              <p className="text-stone-400 mb-10">Authorized Florist Signature:</p>
              <div className="border-b border-stone-400 w-48 ml-auto"></div>
              <p className="text-stone-600 mt-1">{shopName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
