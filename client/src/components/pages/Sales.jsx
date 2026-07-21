import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Calendar, Clock } from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("pos-bills");
    setBills(saved ? JSON.parse(saved) : []);

    const onUpdate = (e) => {
      const detail = e?.detail;
      if (detail) setBills(detail);
      else {
        const s = localStorage.getItem("pos-bills");
        setBills(s ? JSON.parse(s) : []);
      }
    };
    window.addEventListener("pos:bills:updated", onUpdate);
    return () => window.removeEventListener("pos:bills:updated", onUpdate);
  }, []);

  const getPeriodTotals = (days) => {
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const startTime = now - days * msInDay;
    return bills.reduce(
      (acc, bill) => {
        const billTime = new Date(bill.date).getTime();
        if (billTime >= startTime) {
          const billRevenue = (bill.items || []).reduce(
            (sum, item) =>
              sum + Number(item.salePrice || 0) * Number(item.quantity || 0),
            0,
          );
          const billProfit = (bill.items || []).reduce((sum, item) => {
            const cost = Number(item.costPrice || item.purchasePrice || 0);
            return (
              sum +
              (Number(item.salePrice || 0) - cost) * Number(item.quantity || 0)
            );
          }, 0);
          acc.revenue += billRevenue;
          acc.profit += billProfit;
        }
        return acc;
      },
      { revenue: 0, profit: 0 },
    );
  };

  const daily = getPeriodTotals(1);
  const weekly = getPeriodTotals(7);
  const monthly = getPeriodTotals(30);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales Summary</h1>
        <button
          onClick={() => navigate("/billing")}
          className="px-4 py-2 bg-white rounded-lg border"
        >
          Go to Billing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Wallet />
            <div>
              <p className="text-sm text-gray-500">Daily Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{daily.revenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Profit: ₹{daily.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar />
            <div>
              <p className="text-sm text-gray-500">Weekly Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{weekly.revenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Profit: ₹{weekly.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Clock />
            <div>
              <p className="text-sm text-gray-500">Monthly Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{monthly.revenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Profit: ₹{monthly.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-semibold mb-3">Recent Bills</h2>
        {bills.length === 0 ? (
          <p className="text-gray-500">No bills found.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bills.map((b, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <p className="text-sm font-medium">{b.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(b.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ₹{Number(b.grandTotal || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.status || "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
