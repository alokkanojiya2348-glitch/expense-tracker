import { useState } from 'react';

function TransactionForm({ categories, onAddTransaction }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      id: Date.now(),
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
    });

    setDescription("");
    setAmount("");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Add Transaction
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record a new income entry or expense expenditure
          </p>
        </div>

        {/* Type Segmented Toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
            onClick={() => setType('expense')}
          >
            <span>-</span> Expense
          </button>
          <button
            type="button"
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
            onClick={() => setType('income')}
          >
            <span>+</span> Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Description Field */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="tx-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <input
            id="tx-desc"
            type="text"
            placeholder="e.g. Grocery store, Freelance project"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Amount Field with Prefix */}
        <div className="lg:col-span-2">
          <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Amount
          </label>
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <span className="pl-3 text-slate-400 text-sm font-semibold select-none">$</span>
            <input
              id="tx-amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full py-2.5 px-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Category Field */}
        <div className="lg:col-span-2">
          <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Field */}
        <div className="lg:col-span-2">
          <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Date
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="sm:col-span-2 lg:col-span-2">
          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            <span>Record {type === 'income' ? 'Inflow' : 'Expense'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
