import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Mail, Phone, Store, X, Save, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, edit: null });
  const [view, setView] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dealers');
    if (saved) setDealers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (dealers.length > 0) localStorage.setItem('dealers', JSON.stringify(dealers));
    else localStorage.removeItem('dealers');
  }, [dealers]);

  const filtered = dealers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name required';
    if (!form.email.trim()) err.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Invalid email';
    if (!form.phone.trim()) err.phone = 'Phone required';
    if (!form.city.trim()) err.city = 'City required';
    if (!form.address.trim()) err.address = 'Address required';
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return setErrors(err);

    if (modal.edit) {
      setDealers(dealers.map(d => d.id === modal.edit.id ? { ...d, ...form } : d));
      setMessage('Dealer updated!');
    } else {
      setDealers([{ id: Date.now(), ...form, createdAt: new Date().toISOString() }, ...dealers]);
      setMessage('Dealer created!');
    }
    setTimeout(() => setMessage(''), 3000);
    setModal({ open: false, edit: null });
    setForm({ name: '', email: '', phone: '', address: '', city: '', state: '' });
    setErrors({});
  };

  const handleEdit = (dealer) => {
    setForm(dealer);
    setModal({ open: true, edit: dealer });
  };

  const handleDelete = () => {
    setDealers(dealers.filter(d => d.id !== deleteId));
    setDeleteId(null);
    setMessage('Dealer deleted!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-6">
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dealers</h1>
          <p className="text-gray-500 text-sm">Manage your dealers and distributors</p>
        </div>
        <button onClick={() => { setForm({ name: '', email: '', phone: '', address: '', city: '', state: '' }); setModal({ open: true, edit: null }); setErrors({}); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Create Dealer
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input type="text" placeholder="Search dealers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No dealers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((dealer, index) => (
                  <tr key={dealer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">{dealer.name?.charAt(0).toUpperCase() || "?"}</span>
                        </div>
                        <span className="font-medium text-gray-800">{dealer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dealer.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dealer.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dealer.city}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setView(dealer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(dealer)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(dealer.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setModal({ open: false, edit: null }); setErrors({}); }}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{modal.edit ? 'Edit Dealer' : 'Create Dealer'}</h2>
              <button onClick={() => { setModal({ open: false, edit: null }); setErrors({}); }}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setModal({ open: false, edit: null }); setErrors({}); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Save className="w-4 h-4" /> {modal.edit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {view && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setView(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Dealer Details</h2>
              <button onClick={() => setView(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center"><span className="text-white font-bold text-2xl">{view.name?.charAt(0).toUpperCase() || "?"}</span></div>
                <div><h3 className="text-xl font-semibold">{view.name}</h3></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Email</p><p className="font-medium">{view.email}</p></div>
                <div><p className="text-gray-500">Phone</p><p className="font-medium">{view.phone}</p></div>
                <div><p className="text-gray-500">City</p><p className="font-medium">{view.city}</p></div>
                <div><p className="text-gray-500">State</p><p className="font-medium">{view.state || "N/A"}</p></div>
                <div className="col-span-2"><p className="text-gray-500">Address</p><p className="font-medium">{view.address}</p></div>
                <div><p className="text-gray-500">Created</p><p className="font-medium">{new Date(view.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-semibold mb-2">Delete Dealer</h3>
              <p className="text-gray-600 text-sm">Are you sure? This action cannot be undone.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dealers;