import { useState, useEffect } from 'react';
import Summary from './components/Summary';
import BarChart from './components/BarChart';
import TransactionForm from './components/TransactionForm';
import TransactionFilter from './components/TransactionFilter';
import TransactionTable from './components/TransactionTable';

const INITIAL_TRANSACTIONS = [
  { id: 1, description: "Software Engineering Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
  { id: 2, description: "Apartment Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
  { id: 3, description: "Organic Grocery Market", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
  { id: 4, description: "Freelance Consulting Fee", amount: 800, type: "income", category: "salary", date: "2025-01-05" },
  { id: 5, description: "Electric & Water Utilities", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
  { id: 6, description: "Bistro Dinner Outing", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
  { id: 7, description: "Fuel & Highway Transit", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
  { id: 8, description: "Streaming Subscriptions", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
];

const CATEGORIES = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

function App() {
  // Theme state: dark | light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finance_app_theme') || 'dark';
  });

  // Transactions state
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('expense_tracker_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions:', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Synchronize theme with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finance_app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Synchronize transactions with LocalStorage
  useEffect(() => {
    localStorage.setItem('expense_tracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Overall financial metric calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  // Filter & Search pipeline
  let filtered = transactions.filter(t => {
    const matchesSearch = searchQuery.trim() === '' ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCat;
  });

  // Sorting pipeline
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortBy === 'amount-asc') return parseFloat(a.amount) - parseFloat(b.amount);
    return 0;
  });

  const handleAddTransaction = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setSortBy('date-desc');
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["ID,Date,Description,Type,Category,Amount"];
    const rows = transactions.map(t =>
      `"${t.id}","${t.date}","${t.description.replace(/"/g, '""')}","${t.type}","${t.category}","${t.amount}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
        
        {/* Top Application Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="10" y2="15" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Finance Ledger
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Wealth tracking, categorized analytics & expense intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export to CSV */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
              onClick={handleExportCSV}
              title="Export all transactions to CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>

            {/* Theme Switcher Toggle */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Light
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark
                </>
              )}
            </button>
          </div>
        </header>

        {/* Metric Summary Cards */}
        <Summary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        {/* Interactive Expense Analytics & Bar Chart */}
        <BarChart
          transactions={transactions}
          onSelectCategoryFilter={(cat) => setFilterCategory(cat)}
        />

        {/* Add Transaction Form */}
        <TransactionForm
          categories={CATEGORIES}
          onAddTransaction={handleAddTransaction}
        />

        {/* Transactions Section with Filters, Search & Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Ledger Transactions
            </h2>
          </div>

          <TransactionFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={CATEGORIES}
            onResetFilters={handleResetFilters}
            totalResults={filtered.length}
          />

          <TransactionTable
            transactions={filtered}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
