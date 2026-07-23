import React, { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const STORAGE_KEY = "pos-expenses";

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { addToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  const saveExpenses = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setExpenses(next);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      addToast("Enter a valid amount", "error");
      return;
    }
    const entry = { id: Date.now(), amount: amt, category, note, date };
    const next = [entry, ...expenses];
    saveExpenses(next);
    setAmount("");
    setCategory("General");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
    addToast("Expense saved", "success");
  };

  const handleClear = () => {
    if (!window.confirm("Clear all expenses?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setExpenses([]);
    addToast("All expenses cleared", "info");
  };

  const handleRemove = (id) => {
    const next = expenses.filter((e) => e.id !== id);
    saveExpenses(next);
    addToast("Expense removed", "info");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">
            Add daily expenses and persist them locally.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Add Expense
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-3">Recorded Expenses</h3>
            {expenses.length === 0 ? (
              <p className="text-gray-500">
                No expenses yet. Use Add Expense to record daily costs.
              </p>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        ₨{Number(exp.amount).toFixed(2)}{" "}
                        <span className="text-sm text-gray-500">
                          · {exp.category}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">{exp.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(exp.date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleRemove(exp.id)}
                        className="text-red-500 text-sm mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
      </div>

      {/* Modal/Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">New Expense</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAdd}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Note</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a note (optional)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="date"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expense;