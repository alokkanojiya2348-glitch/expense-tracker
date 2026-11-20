const CATEGORY_STYLES = {
  food: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60' },
  housing: { color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60' },
  utilities: { color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800/60' },
  transport: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/60' },
  entertainment: { color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800/60' },
  salary: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60' },
  other: { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
};

function TransactionTable({ transactions, onDeleteTransaction }) {
  if (transactions.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-60">
          <circle cx="12" cy="12" r="10"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
          No matching transactions
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Try adjusting your search query or reset active filters to view records.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-3 px-3.5 w-12 text-center">Type</th>
            <th className="py-3 px-3.5 w-28">Date</th>
            <th className="py-3 px-3.5">Description</th>
            <th className="py-3 px-3.5 w-36">Category</th>
            <th className="py-3 px-3.5 w-32 text-right">Amount</th>
            <th className="py-3 px-3.5 w-16 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {transactions.map((t) => {
            const isIncome = t.type === 'income';
            const cat = t.category?.toLowerCase() || 'other';
            const catStyle = CATEGORY_STYLES[cat] || CATEGORY_STYLES.other;

            return (
              <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                {/* Type Indicator */}
                <td className="py-3 px-3.5 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                  }`}>
                    {isIncome ? '↓' : '↑'}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 px-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {t.date}
                </td>

                {/* Description */}
                <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-slate-100">
                  {t.description}
                </td>

                {/* Category Badge */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle.color} ${catStyle.bg}`}>
                    {t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : 'Other'}
                  </span>
                </td>

                {/* Amount */}
                <td className={`py-3 px-3.5 font-mono font-bold text-sm text-right whitespace-nowrap ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isIncome ? '+' : '-'}${parseFloat(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                {/* Delete Button */}
                <td className="py-3 px-3.5 text-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    onClick={() => onDeleteTransaction(t.id)}
                    title="Delete transaction"
                    aria-label={`Delete ${t.description}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
