import React, { useEffect, useState } from "react";
import { useToast } from "../toast/ToastProvider";
import { DollarSign, Users, ShoppingBag } from "lucide-react";

const Barrow = () => {
  const [allBills, setAllBills] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedBills = localStorage.getItem("pos-bills");
    if (savedBills) {
      setAllBills(JSON.parse(savedBills));
    }
  }, []);

  const creditBills = allBills.filter(
    (bill) => bill.paymentMethod === "barrow" || bill.status === "Credit",
  );
  const totalCredit = creditBills.reduce(
    (sum, bill) => sum + Number(bill.grandTotal || 0),
    0,
  );

  const clearCredit = () => {
    if (window.confirm("Clear all barrow/credit records?")) {
      const remaining = allBills.filter(
        (bill) => bill.paymentMethod !== "barrow" && bill.status !== "Credit",
      );
      localStorage.setItem("pos-bills", JSON.stringify(remaining));
      setAllBills(remaining);
      addToast("Barrow records cleared.", "info");
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
          <h1 className="text-2xl font-bold text-gray-900">Barrow / Credit</h1>
          <p className="text-gray-500 mt-1">
            Manage outstanding credit sales and pending balances.
          </p>
        </div>
        <button
          onClick={clearCredit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <DollarSign size={18} /> Clear Barrow Records
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Outstanding Amount
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-3">
            ₨{totalCredit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Credit Invoices
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-3">
            {creditBills.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {creditBills.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <ShoppingBag size={40} className="text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">No barrow or credit sales found.</p>
          </div>
        ) : (
          creditBills.map((bill, index) => (
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
                  <p className="text-sm text-gray-500">Outstanding</p>
                  <p className="font-semibold text-blue-600">
                    ₨{bill.grandTotal?.toFixed(2)}
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
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(bill.date)}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-xs text-gray-500">Payment Type</p>
                  <p className="font-semibold text-gray-900">
                    {bill.paymentType || "Barrow"}
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

export default Barrow;
