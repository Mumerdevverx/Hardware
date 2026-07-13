import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { Package, Search, Plus, ShoppingCart } from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome to your POS dashboard</p>
        </div>
        <button
          onClick={() => navigate("/add-items")}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      {/* Products Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">All Products</h2>

        {items.length === 0 ? (
          <div className="bg-white text-center py-16 rounded-xl shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add New Item" to create your first product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                  )}
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {item.category || "General"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-lg font-bold text-blue-600">${Number(item.salePrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Stock</p>
                      <p className="text-sm font-semibold text-gray-700">{item.quantity} pcs</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;