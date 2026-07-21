import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useToast } from "../toast/ToastProvider";
import { Plus, X, Package, Edit, Trash2, Eye } from "lucide-react";

const AddItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    imageUrl: ""
  });
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Load items from localStorage on component mount
  useEffect(() => {
    loadItemsFromStorage();
    // Also try to fetch from API if needed
    fetchItems();
  }, []);

  // Load from localStorage
  const loadItemsFromStorage = () => {
    try {
      const savedItems = localStorage.getItem("pos-items");
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setItems(parsedItems);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return false;
    }
  };

  // Save items to localStorage
  const saveItemsToStorage = (itemsData) => {
    try {
      localStorage.setItem("pos-items", JSON.stringify(itemsData));
      console.log("Items saved to localStorage:", itemsData.length);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("pos-token");
      const response = await fetch(`${API_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      
      // Parse API response
      let itemsArray = [];
      if (data && Array.isArray(data)) {
        itemsArray = data;
      } else if (data && data.items && Array.isArray(data.items)) {
        itemsArray = data.items;
      } else if (data && data.data && Array.isArray(data.data)) {
        itemsArray = data.data;
      } else {
        itemsArray = [];
      }
      
      // If itemsArray has data, update state and localStorage
      if (itemsArray.length > 0) {
        setItems(itemsArray);
        saveItemsToStorage(itemsArray);
      } else {
        // If API returns empty, try localStorage
        const hasLocalData = loadItemsFromStorage();
        if (!hasLocalData) {
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // On API error, try localStorage
      const hasLocalData = loadItemsFromStorage();
      if (!hasLocalData) {
        setItems([]);
      }
      // Don't show error toast if we have local data
      if (!loadItemsFromStorage()) {
        addToast("Failed to load items from server, using local data", "warning");
      }
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      purchasePrice: "",
      salePrice: "",
      quantity: "",
      imageUrl: ""
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
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
    setLoading(true);

    try {
      // Generate unique ID for new items
      const newItem = {
        ...form,
        _id: editingItem ? (editingItem._id || editingItem.id) : `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id: editingItem ? (editingItem.id || editingItem._id) : `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: editingItem ? (editingItem.createdAt || new Date().toISOString()) : new Date().toISOString()
      };

      // Try to save to API
      try {
        const token = localStorage.getItem("pos-token");
        const url = editingItem 
          ? `${API_URL}/api/items/${editingItem._id || editingItem.id}` 
          : `${API_URL}/api/items`;
        
        const method = editingItem ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        });

        if (response.ok) {
          const data = await response.json();
          // If API returns data, use it
          if (data && (data._id || data.id)) {
            const savedItem = {
              ...form,
              _id: data._id || data.id,
              id: data.id || data._id,
              createdAt: data.createdAt || new Date().toISOString()
            };
            
            let updatedItems;
            if (editingItem) {
              updatedItems = items.map(item => 
                (item._id === editingItem._id || item.id === editingItem.id) ? savedItem : item
              );
            } else {
              updatedItems = [...items, savedItem];
            }
            
            setItems(updatedItems);
            saveItemsToStorage(updatedItems);
            addToast(`Item ${editingItem ? 'updated' : 'added'} successfully!`, "success");
            closeModal();
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn("API save failed, using localStorage only:", apiError);
      }

      // If API fails, save to localStorage only
      let updatedItems;
      if (editingItem) {
        updatedItems = items.map(item => 
          (item._id === editingItem._id || item.id === editingItem.id) ? newItem : item
        );
      } else {
        updatedItems = [...items, newItem];
      }
      
      setItems(updatedItems);
      saveItemsToStorage(updatedItems);
      addToast(`Item ${editingItem ? 'updated' : 'added'} successfully! (Saved locally)`, "success");
      closeModal();

    } catch (error) {
      console.error("Submit error:", error);
      addToast("Failed to save item. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      // Try to delete from API
      try {
        const token = localStorage.getItem("pos-token");
        const response = await fetch(`${API_URL}/api/items/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Remove from state and localStorage
          const updatedItems = items.filter(item => (item._id !== itemId && item.id !== itemId));
          setItems(updatedItems);
          saveItemsToStorage(updatedItems);
          addToast("Item deleted successfully!", "success");
          return;
        }
      } catch (apiError) {
        console.warn("API delete failed, deleting from localStorage only:", apiError);
      }

      // If API fails, delete from localStorage only
      const updatedItems = items.filter(item => (item._id !== itemId && item.id !== itemId));
      setItems(updatedItems);
      saveItemsToStorage(updatedItems);
      addToast("Item deleted successfully! (Local)", "success");

    } catch (error) {
      console.error("Delete error:", error);
      addToast("Failed to delete item", "error");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Items Grid */}
      {!items || items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No items available</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add New Item" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-700">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-medium text-gray-700">₹{item.salePrice}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id || item.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                    Sale Price *
                  </label>
                  <input
                    name="salePrice"
                    value={form.salePrice}
                    onChange={handleChange}
                    type="number"
                    placeholder="Sale price"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
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
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={18} />
                  {loading ? "Saving..." : editingItem ? "Update Item" : "Save Item"}
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