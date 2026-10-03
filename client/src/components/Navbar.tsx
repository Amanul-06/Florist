import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Flower2,
  Users2,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDailyModal: () => void;
  onOpenProjectModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDailyModal,
  onOpenProjectModal
}) => {
  const { currency, setCurrency, shopName } = useCurrency();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Business', icon: CalendarDays },
    { id: 'projects', label: 'Projects & Events', icon: Briefcase },
    { id: 'flowers', label: 'Flower Catalog', icon: Flower2 },
    { id: 'labourers', label: 'Labourers', icon: Users2 },
    { id: 'reports', label: 'Reports & P&L', icon: BarChart3 }
  ];

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Branding Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Shop Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-serif tracking-tight text-stone-900 leading-tight">
                {shopName}
              </h1>
              <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">
                Florist Operations & Financial Manager
              </p>
            </div>
          </div>

          {/* Right Header Utilities: Today Date, Currency Switcher, Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Live Date Pill */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>{todayStr}</span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-stone-400 font-medium">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="₹">₹ INR</option>
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="AED">AED</option>
                <option value="C$">C$ CAD</option>
                <option value="A$">A$ AUD</option>
              </select>
            </div>

            {/* Quick Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenDailyModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <span>+</span> Log Daily CP/SP
              </button>
              <button
                onClick={onOpenProjectModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <span>+</span> New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-stone-50/70 border-t border-stone-200/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
