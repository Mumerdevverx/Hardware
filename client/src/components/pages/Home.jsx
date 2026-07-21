import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { Package, Search, Plus, Minus, ShoppingBag, X, Wallet, CreditCard } from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  // Load items from localStorage
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

  const loadItems = async () => {
    try {
      const token = localStorage.getItem("pos-token");
      const response = await fetch(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
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
        
        if (itemsArray.length > 0) {
          setItems(itemsArray);
          localStorage.setItem("pos-items", JSON.stringify(itemsArray));
        } else {
          const hasLocalData = loadItemsFromStorage();
          if (!hasLocalData) {
            setItems([]);
          }
        }
      } else {
        const hasLocalData = loadItemsFromStorage();
        if (!hasLocalData) {
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Load items error:", error);
      const hasLocalData = loadItemsFromStorage();
      if (!hasLocalData) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "pos-items" && e.newValue) {
        try {
          const updatedItems = JSON.parse(e.newValue);
          if (Array.isArray(updatedItems)) {
            setItems(updatedItems);
          }
        } catch (error) {
          console.error("Error parsing storage change:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart (click on card)
  const addToCart = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => (i._id || i.id) === (item._id || item.id));
      if (existing) {
        return prev.map(i =>
          (i._id || i.id) === (item._id || item.id)
            ? { ...i, quantity: (i.quantity || 0) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    addToast(`${item.name} added to cart! 🛒`, "success");
  };

  // Update quantity in cart popup
  const updatePopupQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      const item = prev.find(i => (i._id || i.id) === itemId);
      if (!item) return prev;
      
      const newQuantity = (item.quantity || 0) + change;
      if (newQuantity <= 0) {
        return prev.filter(i => (i._id || i.id) !== itemId);
      }
      return prev.map(i =>
        (i._id || i.id) === itemId
          ? { ...i, quantity: newQuantity }
          : i
      );
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setSelectedItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
    addToast("Item removed from cart", "info");
    if (selectedItems.length === 1) {
      setShowCartPopup(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      return sum + (Number(item.salePrice || 0) * Number(item.quantity || 0));
    }, 0);
  };

  // Calculate total items in cart
  const getTotalItems = () => {
    return selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  };

  // Navigate to billing
  const goToBilling = () => {
    if (selectedItems.length === 0) {
      addToast("Please add items to cart first!", "error");
      return;
    }
    setShowCartPopup(false);
    navigate("/billing", {
      state: {
        items: selectedItems,
        total: calculateTotal(),
        paymentMethod: 'cash'
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setSelectedItems([]);
      addToast("Cart cleared", "info");
      setShowCartPopup(false);
    }
  };

  // Toggle cart popup
  const toggleCartPopup = () => {
    if (selectedItems.length === 0) {
      addToast("Your cart is empty. Add some items first!", "info");
      return;
    }
    setShowCartPopup(!showCartPopup);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🏪 POS Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Click on product to add to cart
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {items.length} products available
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {/* Cart Icon Button with Badge */}
          <button
            onClick={toggleCartPopup}
            className="relative bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ShoppingBag size={20} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Cart</span>
            {selectedItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/add-items")}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Products Grid - 4 Cards in a Row */}
      {filteredItems.length === 0 ? (
        <div className="bg-white text-center py-16 rounded-xl shadow-sm border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? "Try a different search term" : "Click 'Add New Item' to create your first product."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isInCart = selectedItems.some(i => (i._id || i.id) === (item._id || item.id));
            return (
              <div
                key={item._id || item.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group ${
                  isInCart ? 'border-green-500 border-2' : 'border-gray-200'
                }`}
                onClick={() => addToCart(item)}
              >
                <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-300" />
                  )}
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {item.category || "General"}
                  </span>
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Stock: {item.quantity}
                  </div>
                  {isInCart && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ In Cart
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-bold text-blue-600">₹{Number(item.salePrice || 0).toFixed(2)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                        isInCart 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus size={14} /> {isInCart ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Popup Modal */}
      {showCartPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag size={24} className="text-blue-600" />
                Your Cart
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                  {getTotalItems()} items
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowCartPopup(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {selectedItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add some items from the dashboard</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item._id || item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">₹{Number(item.salePrice || 0).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id || item.id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updatePopupQuantity(item._id || item.id, -1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition text-lg font-bold"
                            >
                              −
                            </button>
                            <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updatePopupQuantity(item._id || item.id, 1)}
                              className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-blue-600 text-lg">
                            ₹{(Number(item.salePrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total and Action */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={goToBilling}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 text-lg"
                    >
                      <Plus size={20} />
                      Update & Go to Bill
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;