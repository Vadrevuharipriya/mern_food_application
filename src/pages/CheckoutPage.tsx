import { useState } from 'react';
import { X, IndianRupee, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutPage({ onClose, onSuccess }: CheckoutPageProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'cod'>('card');
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: profile?.address_line1 || '',
    addressLine2: profile?.address_line2 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postalCode: profile?.postal_code || '',
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  if (!cart || !user) return null;

  const deliveryFee = cart.restaurant.delivery_fee;
  const tax = cartTotal * 0.05;
  const total = cartTotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            restaurant_id: cart.restaurant_id,
            order_number: orderNumber,
            status: 'pending',
            subtotal: cartTotal,
            delivery_fee: deliveryFee,
            tax: tax,
            discount: 0,
            total_amount: total,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
            delivery_instructions: deliveryInstructions,
            estimated_delivery_time: new Date(Date.now() + 45 * 60000).toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        item_name: item.menu_item.name,
        item_price: item.menu_item.price,
        quantity: item.quantity,
        special_instructions: item.special_instructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();
      onSuccess();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
    { id: 'cod', name: 'Cash on Delivery', icon: IndianRupee },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Address Line 1"
                value={deliveryAddress.addressLine1}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, addressLine1: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={deliveryAddress.addressLine2}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, addressLine2: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={deliveryAddress.postalCode}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Instructions</h3>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="Add any special instructions for delivery..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-900">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Items ({cart.items.length})</span>
                <div className="flex items-center font-medium">
                  <IndianRupee className="w-4 h-4" />
                  <span>{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <div className="flex items-center font-medium">
                  <IndianRupee className="w-4 h-4" />
                  <span>{deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (5%)</span>
                <div className="flex items-center font-medium">
                  <IndianRupee className="w-4 h-4" />
                  <span>{tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5" />
                  <span>{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !deliveryAddress.addressLine1 || !deliveryAddress.city}
            className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
