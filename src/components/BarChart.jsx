import { useState } from 'react';

const CATEGORY_THEMES = {
  food: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', name: 'Food & Dining' },
  housing: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', name: 'Housing & Rent' },
  utilities: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', name: 'Utilities' },
  transport: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', name: 'Transport' },
  entertainment: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', name: 'Entertainment' },
  salary: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', name: 'Salary & Inflow' },
  other: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', name: 'Other' },
};

function BarChart({ transactions, onSelectCategoryFilter }) {
  const [viewMode, setViewMode] = useState('category'); // 'category' | 'comparison'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // 1. Calculate Expenses by Category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    const cat = (t.category || 'other').toLowerCase();
    acc[cat] = (acc[cat] || 0) + parseFloat(t.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([cat, amount]) => {
      const theme = CATEGORY_THEMES[cat] || { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', name: cat };
      return {
        key: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        fullName: theme.name,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0',
        color: theme.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 2. Calculate Comparison Data (Income vs Expense)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const combinedTotal = totalIncome + totalExpense;

  const comparisonData = [
    {
      key: 'income',
      label: 'Income',
      fullName: 'Total Recorded Income',
      amount: totalIncome,
      color: '#10b981',
      percentage: combinedTotal > 0 ? ((totalIncome / combinedTotal) * 100).toFixed(1) : '0.0',
    },
    {
      key: 'expense',
      label: 'Expenses',
      fullName: 'Total Recorded Expenses',
      amount: totalExpense,
      color: '#f43f5e',
      percentage: combinedTotal > 0 ? ((totalExpense / combinedTotal) * 100).toFixed(1) : '0.0',
    },
  ];

  const activeData = viewMode === 'category' ? categoryData : comparisonData;
  const maxAmount = Math.max(...activeData.map(d => d.amount), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Analytics
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {viewMode === 'category'
              ? 'Spending volume distributed by expenditure category'
              : 'Direct comparison between operational earnings and spending'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'category'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => {
              setViewMode('category');
              setHoveredIdx(null);
            }}
          >
            By Category
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'comparison'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => {
              setViewMode('comparison');
              setHoveredIdx(null);
            }}
          >
            Income vs Expense
          </button>
        </div>
      </div>

      {activeData.length === 0 || (viewMode === 'category' && totalExpense === 0) ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-60">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          <p className="text-sm">No expense data recorded yet to render visual distribution.</p>
        </div>
      ) : (
        <div>
          {/* Main Visual Bars */}
          <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-3 px-2 border-b border-slate-100 dark:border-slate-800">
            {activeData.map((item, idx) => {
              const heightPct = Math.max((item.amount / maxAmount) * 100, 6);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.key}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs shadow-xl border border-slate-700 pointer-events-none whitespace-nowrap text-center">
                      <div className="font-semibold text-slate-200">{item.fullName || item.label}</div>
                      <div className="font-mono text-emerald-400 font-bold">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.percentage}% of {viewMode === 'category' ? 'expenses' : 'volume'}
                      </div>
                    </div>
                  )}

                  {/* Value Above Bar */}
                  <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    ${item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : Math.round(item.amount)}
                  </span>

                  {/* Vertical Bar Cylinder */}
                  <div className="w-full max-w-[48px] h-36 bg-slate-100 dark:bg-slate-800/60 rounded-lg flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full rounded-md transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: item.color,
                        boxShadow: isHovered ? `0 0 16px ${item.color}88` : 'none',
                      }}
                    />
                  </div>

                  {/* Label Below Bar */}
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2 truncate w-full text-center" title={item.label}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Legend Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mt-5">
            {activeData.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-xs transition-all cursor-pointer"
                onClick={() => onSelectCategoryFilter && viewMode === 'category' && onSelectCategoryFilter(item.key)}
                title={viewMode === 'category' ? 'Click to filter table by this category' : ''}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                <span className="ml-auto font-mono text-slate-900 dark:text-white font-semibold">
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BarChart;
