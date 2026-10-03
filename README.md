# 🌸 Florist Shop Management System

A modern, responsive, and intuitive internal management application engineered specifically for a florist shop owner/admin.

It streamlines daily retail flower procurement and sales, as well as high-value custom event and wedding decor contracts, with automated costing, profit margins, and consolidated financial reporting.

---

## ✨ Features & Modules

### 1. 📊 Executive Dashboard
- **Real-Time Financial KPIs**: Today's Profit (SP - CP), Month-to-Date Revenue, Active Projects Count, Net Business Earnings, and Receivables Due.
- **Interactive Daily Trend Visualization**: Visual comparison of Sales Price (SP) vs Cost Price (CP) vs Net Profit.
- **Top Flowers Consumed**: Top flower varieties ranked by project expenditure.
- **Recent Projects Roster**: Quick view of upcoming events with status and profitability pills.

### 2. 📅 Daily Business Register
- Record daily morning flower wholesale purchases from Mandi (**Cost Price - CP**) and counter retail sales (**Sales Price - SP**).
- Track wilted/discarded flower value (**Wastage**).
- Instant automatic calculation of **Daily Net Profit** (`SP - CP`) and margin %.
- Date range filtering (Today, Past 7 Days, This Month, All Time) and search.
- **One-Click CSV Export** of daily records.

### 3. 💼 Event & Decor Projects Costing
- Tailored for weddings, stage backdrops, mandap decor, corporate galas, and banquets.
- **Multi-Component Cost Estimator**:
  - **Fresh Flowers**: Select flower varieties from catalog; default CP auto-populates, enter quantity to calculate subtotal.
  - **Labourers & Decorators**: Select lead designers, decorators, or helpers; default wage rate auto-populates, enter days/hours to calculate subtotal.
  - **Other Direct Expenses**: Transportation / delivery trucks, floral foam (oasis bricks), props/vases rentals, fabric draping, lighting, permits.
- **Automatic Financial Calculations**:
  - `Total Project Cost = Flower Cost + Labour Cost + Other Expenses`
  - `Quoted Revenue = Client Contract Value`
  - `Net Profit = Quoted Revenue - Total Project Cost`
  - `Profit Margin % = (Net Profit / Quoted Revenue) * 100`
  - `Balance Due = Quoted Revenue - Advance Payment`
  - Automated Payment Status (`Pending`, `Partial`, `Paid`).
- **Printable Quotation & Invoice**: Generates a clean, branded invoice/estimate ready to print or save as PDF (`window.print()`).
- **CSV Export** for project financial audits.

### 4. 🌹 Flower Rates Master Catalog
- Standard catalog of flower varieties (Roses, Carnations, Lilies, Orchids, Marigold, Foliage, Fillers, etc.).
- Default Wholesale Cost Price (CP) and default Retail Selling Price (SP).
- Automatic markup % calculator (`((SP - CP) / CP) * 100`).
- Category filtering and search.

### 5. 👷 Labour Roster & Wage Master
- Maintain team of floral designers, stage decorators, arrangement helpers, and delivery logistics crew.
- Contact phone numbers, role/specialization, and default daily or hourly wage rates.
- Active/Inactive availability status.

### 6. 📈 Financial Reports & P&L Statement
- Date-range filtered consolidated Profit & Loss Statement combining:
  1. Daily Retail Shop Operations
  2. Custom Event / Project Contracts
- Comprehensive breakdown: Total Revenue, Total Direct Cost, Net Profit, and Overall Margin %.
- Configurable **Shop Name** and **Currency Symbol** (₹ INR, $ USD, € EUR, £ GBP, AED, etc.) switchable anytime.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js, CORS.
- **Database**: SQLite3 (`server/florist.db`) with automatic pre-seeding and relational integrity (`CASCADE` foreign keys).
- **Zero Config**: Automatically initializes database and seeds realistic florist records upon first launch.

---

## 🚀 How to Run

### Option 1: Quick Dev Runner (Concurrent Server + Client)
```bash
# From the root directory:
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000) (with Vite Hot Module Reloading)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

### Option 2: Production / Unified Server
```bash
# Build the client
npm run build

# Start the unified backend (serves both API & Frontend)
npm run server
```
- Open [http://localhost:5001](http://localhost:5001) in your browser.
