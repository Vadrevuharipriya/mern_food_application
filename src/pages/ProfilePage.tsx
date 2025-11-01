import { useEffect, useState } from 'react';
import { X, User, MapPin, Phone, Mail, Package, IndianRupee, RotateCcw, ChevronDown, Calendar, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

interface ProfilePageProps {
  onClose: () => void;
  onOpenCart?: () => void;
}

export function ProfilePage({ onClose, onOpenCart }: ProfilePageProps) {
  const { profile, updateProfile, signOut } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address_line1: profile?.address_line1 || '',
    address_line2: profile?.address_line2 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postal_code: profile?.postal_code || '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(*),
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    } else {
      alert('Failed to update profile');
    }
  };

  const handleReorder = async (order: Order) => {
    if (!order.order_items || !order.restaurant) return;

    try {
      for (const item of order.order_items) {
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', item.menu_item_id)
          .single();

        if (menuItem) {
          await addToCart(order.restaurant_id, menuItem, item.quantity);
        }
      }
      onClose();
      if (onOpenCart) {
        onOpenCart();
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to add items to cart');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden relative flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Orders
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold">{profile?.full_name}</h3>
                    <p className="text-orange-100 text-lg mt-1">{profile?.email}</p>
                    <p className="text-orange-100 text-sm mt-2">{profile?.phone || 'No phone added'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc."
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={signOut}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No orders yet</p>
                  <p className="text-gray-500 mt-2">Start ordering to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="p-6 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <div className="min-w-0">
                                <p className="font-bold text-sm sm:text-lg text-gray-900 truncate">Order #{order.order_number}</p>
                                <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">{order.restaurant?.name}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:space-x-6 mt-3">
                              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
                                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">{order.order_items?.length || 0} items</span>
                              </div>
                              <div className="flex items-center space-x-1 sm:space-x-2 font-semibold text-gray-900">
                                <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">₹{order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-6 flex-shrink-0">
                            <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                expandedOrderId === order.id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {expandedOrderId === order.id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                              <div className="space-y-3">
                                {order.order_items?.map((item, index) => (
                                  <div key={index} className="flex justify-between items-start bg-white p-3 rounded-lg">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{item.item_name}</p>
                                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center font-semibold text-gray-900">
                                      <IndianRupee className="w-4 h-4" />
                                      <span>{(item.item_price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-bold text-gray-900 mb-4">Delivery Address</h4>
                                <div className="bg-white p-4 rounded-lg">
                                  <p className="text-gray-900 font-medium">{profile?.address_line1}</p>
                                  {profile?.address_line2 && (
                                    <p className="text-gray-600 text-sm">{profile.address_line2}</p>
                                  )}
                                  <p className="text-gray-600 text-sm">
                                    {profile?.city}, {profile?.state} {profile?.postal_code}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-900 mb-4">Price Summary</h4>
                                <div className="bg-white p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>₹{order.delivery_fee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{order.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{order.total_amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6 flex space-x-3">
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                            >
                              <RotateCcw className="w-5 h-5" />
                              <span>Reorder</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="flex-1 border-2 border-orange-500 text-orange-500 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Truck className="w-5 h-5" />
                              <span>Track Order</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}import { useState } from 'react';

