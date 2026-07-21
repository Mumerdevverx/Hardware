import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Printer,
  Download,
  ArrowLeft,
  CreditCard,
  Wallet,
  CheckCircle,
  ShoppingBag,
  X,
  Minus,
  Plus,
  User,
  MapPin,
  Phone,
  History,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "../toast/ToastProvider";

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const billData = location.state || {};
  const {
    items: initialItems = [],
    total = 0,
    paymentMethod: initialPayment = "cash",
  } = billData;

  const [items, setItems] = useState(initialItems);
  const [paymentMethod, setPaymentMethod] = useState(initialPayment);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [cashAmount, setCashAmount] = useState("");
  const [returnAmount, setReturnAmount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [allBills, setAllBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const CART_STORAGE_KEY = "pos-cart";

  // Load bills from localStorage
  useEffect(() => {
    const savedBills = localStorage.getItem("pos-bills");
    if (savedBills) {
      setAllBills(JSON.parse(savedBills));
    }
    if ((!items || items.length === 0) && initialItems.length === 0) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setItems(parsedCart);
        }
      }
    }
  }, []);

  // REMOVED: The auto-redirect that was causing the issue
  // Now it will show a message when no items are present
  useEffect(() => {
    // Just check and show info, don't redirect
    if (!items || items.length === 0) {
      // Don't redirect, just show info
    }
  }, [items]);

  const handlePrint = () => {
    addToast("Printing bill...", "success");
    window.print();
  };

  const handleDownload = () => {
    addToast("Downloading PDF invoice...", "success");
    window.print();
  };

  const billNumber = `BILL-${Date.now()}`;
  const date = new Date();

  // Update quantity in billing page
  const updateQuantity = (itemId, change) => {
    setItems((prev) => {
      const item = prev.find((i) => (i._id || i.id) === itemId);
      if (!item) return prev;

      const newQuantity = (item.quantity || 0) + change;
      if (newQuantity <= 0) {
        return prev.filter((i) => (i._id || i.id) !== itemId);
      }
      return prev.map((i) =>
        (i._id || i.id) === itemId ? { ...i, quantity: newQuantity } : i,
      );
    });
  };

  // Calculate totals (NO TAX)
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.salePrice || 0) * Number(item.quantity || 0);
  }, 0);
  const grandTotal = subtotal;

  // Save bill to localStorage
  const saveBillToStorage = (billData) => {
    try {
      const savedBills = localStorage.getItem("pos-bills");
      let bills = savedBills ? JSON.parse(savedBills) : [];
      bills.unshift(billData);
      localStorage.setItem("pos-bills", JSON.stringify(bills));
      setAllBills(bills);
      setCurrentBill(billData);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const getPeriodTotals = (days) => {
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const startTime = now - days * msInDay;
    return allBills.reduce(
      (acc, bill) => {
        const billTime = new Date(bill.date).getTime();
        if (billTime >= startTime) {
          const billRevenue = bill.items?.reduce((sum, item) => {
            return (
              sum + Number(item.salePrice || 0) * Number(item.quantity || 0)
            );
          }, 0);
          const billProfit = bill.items?.reduce((sum, item) => {
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

  const dailyTotals = getPeriodTotals(1);
  const weeklyTotals = getPeriodTotals(7);
  const monthlyTotals = getPeriodTotals(30);

  // Handle cash payment
  const handleCashPayment = () => {
    if (selectedPayment === "barrow") {
      const billData = {
        id: billNumber,
        date: date.toISOString(),
        customer: {
          name: customerName,
          address: customerAddress,
          phone: customerPhone,
        },
        items: items,
        subtotal: subtotal,
        grandTotal: grandTotal,
        paymentMethod: "barrow",
        status: "Credit",
        paymentType: "Barrow / Credit",
      };
      saveBillToStorage(billData);
      setShowPaymentModal(false);
      setShowCompleteModal(true);
      addToast("Payment successful! Amount added to barrow/credit", "success");
      return;
    }

    const cash = parseFloat(cashAmount);
    if (!cash || cash < grandTotal) {
      addToast(
        `Please enter amount greater than or equal to ₹${grandTotal.toFixed(2)}`,
        "error",
      );
      return;
    }
    const change = cash - grandTotal;
    setReturnAmount(change);

    const billData = {
      id: billNumber,
      date: date.toISOString(),
      customer: {
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
      },
      items: items,
      subtotal: subtotal,
      grandTotal: grandTotal,
      cashAmount: cash,
      changeAmount: change,
      paymentMethod: "cash",
      status: "Paid",
      paymentType: "Hand Cash",
    };
    saveBillToStorage(billData);
    addToast(`Payment successful! Change: ₹${change.toFixed(2)}`, "success");
    setShowPaymentModal(false);
    setShowCompleteModal(true);
  };

  // Handle online payment
  const handleOnlinePayment = () => {
    const billData = {
      id: billNumber,
      date: date.toISOString(),
      customer: {
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
      },
      items: items,
      subtotal: subtotal,
      grandTotal: grandTotal,
      paymentMethod: "online",
      status: "Paid",
      paymentType: "Online Payment",
    };
    saveBillToStorage(billData);
    setShowPaymentModal(false);
    setShowCompleteModal(true);
    addToast("Online payment successful!", "success");
  };

  const getWhatsAppMessage = () => {
    const raw = `Invoice ${billNumber}\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\n\nItems:\n${items.map((item) => `- ${item.name} x${item.quantity} @ ₹${Number(item.salePrice || 0).toFixed(2)}`).join("\n")}\n\nSubtotal: ₹${subtotal.toFixed(2)}\nGrand Total: ₹${grandTotal.toFixed(2)}\n\nThank you!`;
    return `https://wa.me/?text=${encodeURIComponent(raw)}`;
  };

  // Handle payment submit
  const handlePaymentSubmit = () => {
    if (!customerName.trim()) {
      addToast("Please enter customer name", "error");
      return;
    }
    if (!customerAddress.trim()) {
      addToast("Please enter customer address", "error");
      return;
    }
    if (!customerPhone.trim()) {
      addToast("Please enter customer phone", "error");
      return;
    }

    if (selectedPayment === "cash") {
      handleCashPayment();
    } else if (selectedPayment === "online") {
      handleOnlinePayment();
    } else if (selectedPayment === "barrow") {
      handleCashPayment();
    }
  };

  // Reset and go back to home
  const goToHome = () => {
    setShowCompleteModal(false);
    navigate("/home");
  };

  // Clear all bills
  const clearAllBills = () => {
    if (window.confirm("Are you sure you want to clear all bill history?")) {
      localStorage.removeItem("pos-bills");
      setAllBills([]);
      setCurrentBill(null);
      addToast("All bills cleared!", "info");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Payment option labels
  const paymentOptions = [
    {
      id: "cash",
      label: "Hand Cash",
      icon: <Wallet size={20} />,
      color: "green",
    },
    {
      id: "online",
      label: "Online Payment",
      icon: <CreditCard size={20} />,
      color: "purple",
    },
    {
      id: "barrow",
      label: "Barrow / Credit",
      icon: <User size={20} />,
      color: "orange",
    },
  ];

  // If no items, show empty state
  if (!items || items.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <History size={20} /> {showHistory ? "Hide" : "Show"} History (
              {allBills.length})
            </button>
          </div>
        </div>

        {/* Empty State */}

        {/* Bill History */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                Recent Bills
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                  {allBills.length} bills
                </span>
              </h2>
              {allBills.length > 0 && (
                <button
                  onClick={clearAllBills}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                >
                  <Trash2 size={16} /> Clear All
                </button>
              )}
            </div>

            <div className="p-4">
              {allBills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No bills found. Complete a payment to see history here.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {allBills.map((bill, index) => (
                    <div
                      key={index}
                      className={`bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition border-l-4 ${
                        bill.status === "Paid"
                          ? "border-green-500"
                          : "border-orange-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {bill.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(bill.date)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Customer:</span>{" "}
                            {bill.customer?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Items:</span>{" "}
                            {bill.items?.length || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ₹{bill.grandTotal?.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                              bill.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {bill.status || "Pending"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {bill.paymentType || bill.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <History size={20} /> {showHistory ? "Hide" : "Show"} History (
            {allBills.length})
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={20} /> Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} /> PDF
          </button>
          <a
            href={getWhatsAppMessage()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <ShoppingCart size={20} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Daily Sales</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{dailyTotals.revenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Profit: ₹{dailyTotals.profit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Weekly Sales</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{weeklyTotals.revenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Profit: ₹{weeklyTotals.profit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Monthly Sales</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{monthlyTotals.revenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Profit: ₹{monthlyTotals.profit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bill Card */}
      <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-blue-100 text-sm">POS System</p>
              <p className="text-blue-200 text-xs mt-1">Your Trusted Store</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Bill #</p>
              <p className="font-bold text-lg">{billNumber}</p>
            </div>
          </div>
        </div>

        {/* Bill Info */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-500 mt-2">Time</p>
              <p className="font-medium">
                {date.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="flex items-center justify-end gap-2 font-medium text-blue-600">
                {paymentMethod === "cash" ? (
                  <Wallet size={20} />
                ) : paymentMethod === "online" ? (
                  <CreditCard size={20} />
                ) : (
                  <User size={20} />
                )}
                <span>
                  {paymentMethod === "cash"
                    ? "Hand Cash"
                    : paymentMethod === "online"
                      ? "Online Payment"
                      : "Barrow / Credit"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Status</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle size={14} /> Paid
              </span>
            </div>
          </div>
        </div>

        {/* Items Table with Quantity Controls */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} />
            Your Cart
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
              {items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}{" "}
              items
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-2 px-2">#</th>
                  <th className="pb-2 px-2">Item</th>
                  <th className="pb-2 px-2 text-right">Price</th>
                  <th className="pb-2 px-2 text-center">Quantity</th>
                  <th className="pb-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item._id || item.id || index}
                    className="border-b border-gray-100"
                  >
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.category || "General"}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      ₹{Number(item.salePrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item._id || item.id, -1)
                          }
                          className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-medium w-8 text-center text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id || item.id, 1)}
                          className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-blue-600">
                      ₹
                      {(
                        Number(item.salePrice || 0) * Number(item.quantity || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals - No Tax */}
          <div className="mt-6 pt-4 border-t-2">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t mt-2">
                  <span className="text-lg font-bold">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm text-gray-500">
                  <span>Total Items:</span>
                  <span>
                    {items.reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button - Bottom Center */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-center">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
              >
                <Wallet size={20} />
                Proceed to Payment
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p className="font-medium text-gray-700">
              Thank you for your business!
            </p>
            <p className="text-xs mt-1">
              Computer-generated invoice. No signature required.
            </p>
            <p className="text-xs mt-2 text-gray-400">
              © {new Date().getFullYear()} POS System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Bill History - Always visible at bottom */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              Recent Bills
              <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                {allBills.length} bills
              </span>
            </h2>
            {allBills.length > 0 && (
              <button
                onClick={clearAllBills}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
              >
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>

          <div className="p-4">
            {allBills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No bills found. Complete a payment to see history here.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {allBills.map((bill, index) => (
                  <div
                    key={index}
                    className={`bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition border-l-4 ${
                      bill.status === "Paid"
                        ? "border-green-500"
                        : "border-orange-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {bill.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(bill.date)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Customer:</span>{" "}
                          {bill.customer?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Items:</span>{" "}
                          {bill.items?.length || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          ₹{bill.grandTotal?.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            bill.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {bill.status || "Pending"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {bill.paymentType || bill.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={24} className="text-blue-600" />
                Payment Details
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setCashAmount("");
                  setReturnAmount(0);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Enter customer address..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedPayment(option.id)}
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition ${
                        selectedPayment === option.id
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className={`text-${option.color}-600`}>
                        {option.icon}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Amount Input (only for cash) */}
              {selectedPayment === "cash" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Cash Amount
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    min={grandTotal}
                    step="0.01"
                  />
                  {returnAmount > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-gray-600">Return Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{returnAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handlePaymentSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 text-lg"
              >
                <CheckCircle size={20} />
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Complete!
            </h2>
            <p className="text-gray-500 mb-1">Invoice #{billNumber}</p>
            <p className="text-gray-500 mb-4">
              Amount: ₹{grandTotal.toFixed(2)}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Customer:</span> {customerName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Payment:</span>{" "}
                {selectedPayment === "cash"
                  ? "Hand Cash"
                  : selectedPayment === "online"
                    ? "Online Payment"
                    : "Barrow / Credit"}
              </p>
            </div>
            <button
              onClick={goToHome}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
