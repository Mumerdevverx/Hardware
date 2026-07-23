import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const BarChart = ({ labels, values, height = 160 }) => {
  const max = Math.max(...values, 1);
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-44">
      {values.map((v, i) => {
        const x = i * (100 / values.length) + 2;
        const w = 100 / values.length - 6;
        const h = (v / max) * (height - 20);
        const y = height - h - 8;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx="1" fill="#2563eb" />
            <text
              x={x + w / 2}
              y={height - 1}
              fontSize="3.5"
              textAnchor="middle"
              fill="#374151"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Reports = () => {
  const [allBills, setAllBills] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("pos-bills");
    if (saved) setAllBills(JSON.parse(saved));

    const onUpdate = (e) => {
      try {
        const bills =
          e && e.detail
            ? e.detail
            : JSON.parse(localStorage.getItem("pos-bills") || "[]");
        setAllBills(bills);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("pos:bills:updated", onUpdate);
    return () => window.removeEventListener("pos:bills:updated", onUpdate);
  }, []);

  const totalRevenue = allBills.reduce(
    (s, b) => s + Number(b.grandTotal || 0),
    0,
  );
  const totalProfit = allBills.reduce((s, b) => {
    return (
      s +
      (b.items?.reduce((is, it) => {
        const cost = Number(it.costPrice || it.purchasePrice || 0);
        return (
          is + (Number(it.salePrice || 0) - cost) * Number(it.quantity || 0)
        );
      }, 0) || 0)
    );
  }, 0);

  // build last 7 days labels and revenue values
  const days = 7;
  const now = new Date();
  const labels = [];
  const revValues = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toDateString();
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    const totalForDay = allBills.reduce((acc, bill) => {
      if (new Date(bill.date).toDateString() === key)
        return acc + Number(bill.grandTotal || 0);
      return acc;
    }, 0);
    revValues.push(totalForDay);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            Charts and summary for recent sales and profit.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={22} className="text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Sales (Last 7 days)</p>
              <p className="text-sm text-gray-500">Daily revenue</p>
            </div>
          </div>
          <BarChart labels={labels} values={revValues} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={22} className="text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Profit Insights</p>
              <p className="text-sm text-gray-500">Quick metrics</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-500">Profit</p>
              <p className="font-semibold text-green-700">
                ₨{totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="font-semibold text-gray-900">
                ₨{totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-sm text-gray-500">Invoices</p>
              <p className="font-semibold text-gray-900">{allBills.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
