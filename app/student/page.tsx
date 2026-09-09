'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Item } from '@/lib/supabase';

export default function StudentPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    descriptionOfLoss: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'found')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  async function handleClaimSubmit(itemId: string) {
    try {
      const { data, error } = await supabase.rpc('submit_claim', {
        p_item_id: itemId,
        p_student_name: claimForm.studentName,
        p_student_email: claimForm.studentEmail,
        p_student_phone: claimForm.studentPhone,
        p_description_of_loss: claimForm.descriptionOfLoss,
      });

      if (error) throw error;

      alert('Claim submitted! Staff will verify it soon.');
      setClaimingItemId(null);
      setClaimForm({ studentName: '', studentEmail: '', studentPhone: '', descriptionOfLoss: '' });
    } catch (err) {
      console.error('Claim submission failed:', err);
      alert('Failed to submit claim');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Lost & Found</h1>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="phone">Phone</option>
            <option value="wallet">Wallet</option>
            <option value="keys">Keys</option>
            <option value="bag">Bag</option>
            <option value="clothing">Clothing</option>
            <option value="jewelry">Jewelry</option>
            <option value="electronics">Electronics</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-8">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {item.photo_url && (
                  <img src={item.photo_url} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <p><strong>Location:</strong> {item.location_found}</p>
                    <p><strong>Date Found:</strong> {new Date(item.date_found).toLocaleDateString()}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                  </div>

                  {claimingItemId === item.id ? (
                    <div className="space-y-3 border-t pt-4 mt-4">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={claimForm.studentName}
                        onChange={(e) => setClaimForm({ ...claimForm, studentName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="Your email"
                        value={claimForm.studentEmail}
                        onChange={(e) => setClaimForm({ ...claimForm, studentEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={claimForm.studentPhone}
                        onChange={(e) => setClaimForm({ ...claimForm, studentPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Describe how you lost it (helps us verify)"
                        value={claimForm.descriptionOfLoss}
                        onChange={(e) => setClaimForm({ ...claimForm, descriptionOfLoss: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleClaimSubmit(item.id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
                        >
                          Submit Claim
                        </button>
                        <button
                          onClick={() => setClaimingItemId(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setClaimingItemId(item.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                    >
                      Claim This Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  }
