import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../../config";
import { useToast } from "../toast/ToastProvider";
import { Plus, X, Package, Edit, Trash2 } from "lucide-react";

const AddItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    imageUrl: "",
  });

  const { addToast } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("pos-token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("pos-token");
      const response = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch products");
      }

      const data = await response.json();
      const itemsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setItems(itemsArray);
      localStorage.setItem("pos-items", JSON.stringify(itemsArray));
    } catch (error) {
      console.error("Fetch error:", error);
      addToast(`Failed to load items: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      purchasePrice: "",
      sellingPrice: "",
      quantity: "",
      imageUrl: "",
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || "",
        category: item.category || "",
        purchasePrice: item.purchasePrice ?? "",
        sellingPrice: item.sellingPrice ?? "",
        quantity: item.quantity ?? "",
        imageUrl: item.imageUrl || "",
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantity: Number(form.quantity),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      const url = editingItem
        ? `${API_URL}/api/products/${editingItem._id}`
        : `${API_URL}/api/products`;
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Save failed");
      }

      addToast(
        `Item ${editingItem ? "updated" : "added"} successfully!`,
        "success"
      );
      closeModal();
      await fetchItems();
    } catch (error) {
      console.error("Submit error:", error);
      addToast(`Error: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("pos-token");
      const response = await fetch(`${API_URL}/api/products/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      addToast("Item deleted successfully!", "success");
      await fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
      addToast(`Error: ${error.message}`, "error");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Manage Items</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {items.length} items
          </span>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No items available</p>
          <p className="text-gray-400 text-sm mt-1">
            Click "Add New Item" to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>

                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Qty</p>
                    <p className="font-medium text-gray-700">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Buy</p>
                    <p className="font-medium text-gray-700">₨{item.purchasePrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sell</p>
                    <p className="font-medium text-blue-600 font-bold">₨{item.sellingPrice}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium mb-3 inline-block ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.status || "active"}
                </span>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter product name"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter category"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    type="number"
                    placeholder="Enter quantity"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price *
                  </label>
                  <input
                    name="purchasePrice"
                    value={form.purchasePrice}
                    onChange={handleChange}
                    type="number"
                    placeholder="Purchase price"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleChange}
                    type="number"
                    placeholder="Selling price"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={18} />
                  {saving ? "Saving..." : editingItem ? "Update Item" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItems;
