import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import { useToast } from '../toast/ToastProvider';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const billData = location.state || {};
  const { items = [], total = 0, paymentMethod = 'cash' } = billData;

  React.useEffect(() => {
    if (!items.length) {
      addToast('No bill data found!', 'error');
      navigate('/home');
    }
  }, [items, navigate, addToast]);

  const handlePrint = () => {
    addToast('Printing bill...', 'success');
    window.print();
  };

  const handleDownload = () => {
    addToast('Downloading bill...', 'success');
  };

  const billNumber = `BILL-${Date.now()}`;
  const date = new Date();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Printer size={20} /> Print</button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Download size={20} /> Download</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">INVOICE</h1><p className="text-blue-100 text-sm">POS System</p></div>
            <div className="text-right"><p className="text-sm text-blue-100">Bill #</p><p className="font-bold text-lg">{billNumber}</p></div>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{date.toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mt-2">Time</p>
              <p className="font-medium">{date.toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="flex items-center justify-end gap-2 font-medium text-blue-600">
                {paymentMethod === 'cash' ? <Wallet size={20} /> : <CreditCard size={20} />}
                <span>{paymentMethod === 'cash' ? 'Cash Payment' : 'Online Payment'}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Status</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle size={14} /> Paid
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-2">#</th><th className="pb-2">Item</th>
                <th className="pb-2 text-right">Price</th><th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3"><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.category}</p></td>
                  <td className="py-3 text-right">${Number(item.salePrice || 0).toFixed(2)}</td>
                  <td className="py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded-lg text-sm">{item.quantity}</span></td>
                  <td className="py-3 text-right font-bold">${(Number(item.salePrice || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 pt-4 border-t-2 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2"><span className="text-gray-600">Subtotal:</span><span className="font-medium">${total.toFixed(2)}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-600">Tax (0%):</span><span className="font-medium">$0.00</span></div>
              <div className="flex justify-between py-2 border-t mt-2"><span className="text-lg font-bold">Total:</span><span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span></div>
              <div className="flex justify-between py-2 text-sm text-gray-500">
                <span>Total Items:</span>
                <span>{items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="text-xs mt-1">Computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;