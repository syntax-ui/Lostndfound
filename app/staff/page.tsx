'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Item, Claim } from '@/lib/supabase';

export default function StaffPage() {
  const [user, setUser] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'items' | 'claims'>('items');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'other',
    name: '',
    description: '',
    location_found: '',
    date_found: new Date().toISOString().split('T')[0],
    photo_url: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (schoolId) {
      fetchItems();
      fetchClaims();
    }
  }, [schoolId]);

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    setUser(user);

    // Get staff record to find school_id AND staff.id
    const { data: staffData } = await supabase
      .from('staff')
      .select('id, school_id')
      .eq('user_id', user.id)
      .single();

    if (staffData) {
      setSchoolId(staffData.school_id);
      setStaffId(staffData.id);
    }

    setLoading(false);
  }

  async function fetchItems() {
    if (!schoolId) return;
    try {
      const { data } = await supabase.from('items').select('*').eq('school_id', schoolId);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  }

  async function fetchClaims() {
    if (!schoolId) return;
    try {
      const { data } = await supabase
        .from('claims')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    }
  }

  async function handleAddItem() {
    if (!schoolId || !staffId) return;

    try {
      const { error } = await supabase.from('items').insert({
        school_id: schoolId,
        ...newItem,
        posted_by: staffId,
      });

      if (error) throw error;

      alert('Item posted!');
      setNewItem({
        category: 'other',
        name: '',
        description: '',
        location_found: '',
        date_found: new Date().toISOString().split('T')[0],
        photo_url: '',
      });
      setShowNewItemForm(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to add item:', err);
      alert('Failed to add item');
    }
  }

  async function verifyClaim(claimId: string) {
    if (!staffId) return;

    try {
      await supabase.rpc('verify_claim', {
        p_claim_id: claimId,
        p_staff_id: staffId,
      });

      alert('Claim verified!');
      fetchClaims();
      fetchItems();
    } catch (err) {
      console.error('Failed to verify claim:', err);
      alert('Failed to verify claim');
    }
  }

  async function rejectClaim(claimId: string) {
    try {
      await supabase.rpc('reject_claim', {
        p_claim_id: claimId,
      });

      alert('Claim rejected');
      fetchClaims();
    } catch (err) {
      console.error('Failed to reject claim:', err);
      alert('Failed to reject claim');
    }
  }

  async function completeClaim(claimId: string) {
    try {
      await supabase.rpc('complete_claim', {
        p_claim_id: claimId,
      });

      alert('Claim completed!');
      fetchClaims();
      fetchItems();
    } catch (err) {
      console.error('Failed to complete claim:', err);
      alert('Failed to complete claim');
    }
  }

  async function discardItem(itemId: string) {
    if (!confirm('Are you sure? This will mark the item as discarded.')) return;

    try {
      await supabase.rpc('discard_item', {
        p_item_id: itemId,
      });

      alert('Item discarded');
      fetchItems();
    } catch (err) {
      console.error('Failed to discard item:', err);
      alert('Failed to discard item');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please log in</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Staff Dashboard</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('items')}
            className={`px-4 py-2 rounded font-medium ${
              tab === 'items' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Found Items ({items.length})
          </button>
          <button
            onClick={() => setTab('claims')}
            className={`px-4 py-2 rounded font-medium ${
              tab === 'claims' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Claims ({claims.length})
          </button>
        </div>

        {/* Items Tab */}
        {tab === 'items' && (
          <div>
            <button
              onClick={() => setShowNewItemForm(!showNewItemForm)}
              className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            >
              {showNewItemForm ? 'Cancel' : '+ Post Found Item'}
            </button>

            {showNewItemForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Post a Found Item</h3>
                <div className="space-y-4">
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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

                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Location found"
                    value={newItem.location_found}
                    onChange={(e) => setNewItem({ ...newItem, location_found: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="date"
                    value={newItem.date_found}
                    onChange={(e) => setNewItem({ ...newItem, date_found: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Photo URL (optional)"
                    value={newItem.photo_url}
                    onChange={(e) => setNewItem({ ...newItem, photo_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={handleAddItem}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
                  >
                    Post Item
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        item.status === 'found'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'claimed'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{item.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Location: {item.location_found}</p>
                    <p>Date: {new Date(item.date_found).toLocaleDateString()}</p>
                  </div>
                  {item.status === 'found' && (
                    <button
                      onClick={() => discardItem(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Mark as Discarded
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {tab === 'claims' && (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{claim.student_name}</h3>
                  <p className="text-sm text-gray-600">{claim.student_email}</p>
                  {claim.student_phone && <p className="text-sm text-gray-600">{claim.student_phone}</p>}
                </div>
                <p className="text-gray-700 mb-2">
                  <strong>Claim:</strong> {claim.description_of_loss}
                </p>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : claim.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : claim.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>

                {claim.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => verifyClaim(claim.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => rejectClaim(claim.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {claim.status === 'verified' && (
                  <button
                    onClick={() => completeClaim(claim.id)}
                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}

            {claims.length === 0 && <div className="text-center py-8 text-gray-500">No claims yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
