import { ShoppingCart, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onLoginClick: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
}

export function Header({ onLoginClick, onCartClick, onProfileClick, onLogoClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { cartItemsCount } = useCart();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button onClick={onLogoClick} className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                FoodExpress
              </div>
            </button>

            <div className="hidden md:flex items-center space-x-2 text-gray-700">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">Deliver to</span>
              <button className="text-sm font-semibold hover:text-orange-500">
                {profile?.city || 'Select Location'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onCartClick}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onProfileClick}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-6 h-6 text-gray-700" />
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {profile?.full_name || 'Profile'}
                    </span>
                  </button>

                  <button
                    onClick={signOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
