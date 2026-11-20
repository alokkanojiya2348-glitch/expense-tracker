function TransactionFilter({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  sortBy,
  onSortChange,
  categories,
  onResetFilters,
  totalResults,
}) {
  const isFiltered = searchQuery || filterType !== 'all' || filterCategory !== 'all' || sortBy !== 'date-desc';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 pb-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search by description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Select Controls & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Select */}
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="income">Income (+)</option>
          <option value="expense">Expenses (-)</option>
        </select>

        {/* Category Select */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 cursor-pointer transition-all"
            onClick={onResetFilters}
          >
            Reset
          </button>
        )}

        <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 shrink-0">
          {totalResults} {totalResults === 1 ? 'record' : 'records'}
        </span>
      </div>
    </div>
  );
}

export default TransactionFilter;
