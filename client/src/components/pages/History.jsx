import React, { useEffect, useState } from "react";
import { useToast } from "../toast/ToastProvider";
import { History as HistoryIcon, Trash2 } from "lucide-react";

const History = () => {
  const [allBills, setAllBills] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedBills = localStorage.getItem("pos-bills");
    if (savedBills) {
      setAllBills(JSON.parse(savedBills));
    }
  }, []);

  const clearAllBills = () => {
    if (window.confirm("Are you sure you want to clear all bill history?")) {
      localStorage.removeItem("pos-bills");
      setAllBills([]);
      addToast("All bill history cleared.", "info");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill History</h1>
          <p className="text-gray-500 mt-1">
            View all saved bills and refresh-safe history.
          </p>
        </div>
        <button
          onClick={clearAllBills}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Trash2 size={18} /> Clear All History
        </button>
      </div>

      <div className="grid gap-4">
        {allBills.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <HistoryIcon size={40} className="text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">No bill history found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete a bill from the Dashboard to create history.
            </p>
          </div>
        ) : (
          allBills.map((bill, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <p className="font-semibold text-gray-900">{bill.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(bill.date)}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {bill.customer?.name || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-gray-900">
                    ₹{bill.grandTotal?.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">
                    {bill.status || "Pending"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
