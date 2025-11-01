import { X, Plus, Minus, IndianRupee, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartPageProps {
  onClose: () => void;
  onCheckout: () => void;
}

export function CartPage({ onClose, onCheckout }: CartPageProps) {
  const { cart, cartTotal, updateCartItem, removeFromCart } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600">Add items to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.restaurant.delivery_fee;
  const tax = cartTotal * 0.05;
  const total = cartTotal + deliveryFee + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mt-1">From {cart.restaurant.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex space-x-4 border-b border-gray-200 pb-4">
                <img
                  src={item.menu_item.image_url}
                  alt={item.menu_item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.menu_item.name}</h3>
                      <div className="flex items-center text-gray-900 font-medium mt-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>{item.menu_item.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mt-2 bg-orange-500 text-white rounded-lg w-fit">
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-orange-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
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
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total</span>
              <div className="flex items-center">
                <IndianRupee className="w-5 h-5" />
                <span>{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
