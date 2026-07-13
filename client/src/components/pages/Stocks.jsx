import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { Package, DollarSign, FolderOpen, AlertTriangle, Search, Layers } from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const Stocks = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const token = localStorage.getItem("pos-token");
      const response = await fetch(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(data.items || []);
      }
    } catch (error) {
      addToast("Failed to load items.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = items.length;
  const totalStockValue = items.reduce((sum, item) => 
    sum + (Number(item.salePrice || 0) * Number(item.quantity || 0)), 0
  );
  const totalCategories = new Set(items.filter(item => item.category).map(item => item.category)).size;
  const lowStock = items.filter(item => Number(item.quantity) < 10 && Number(item.quantity) > 0).length;

  const summaryCards = [
    { title: "Total Products", value: totalProducts, icon: <Package className="text-blue-600" size={24} />, bg: "bg-blue-50" },
    { title: "Stock Value", value: `$${totalStockValue.toLocaleString()}`, icon: <DollarSign className="text-green-600" size={24} />, bg: "bg-green-50" },
    { title: "Categories", value: totalCategories, icon: <FolderOpen className="text-purple-600" size={24} />, bg: "bg-purple-50" },
    { title: "Low Stock", value: lowStock, icon: <AlertTriangle className="text-orange-600" size={24} />, bg: "bg-orange-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-white border rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.title}</h2>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{card.value}</p>
            </div>
            <div className={`p-4 rounded-xl ${card.bg}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs">{item.category || "General"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">${Number(item.salePrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${Number(item.quantity || 0) < 10 ? "text-red-600" : "text-gray-700"}`}>
                        {item.quantity || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                      ${(Number(item.salePrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;