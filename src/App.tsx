import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RestaurantPage } from './pages/RestaurantPage';
import { AuthPage } from './pages/AuthPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';

type View = 'home' | 'restaurant' | 'profile';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const handleRestaurantClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView('restaurant');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedRestaurantId('');
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setShowOrderSuccess(true);
    setTimeout(() => {
      setShowOrderSuccess(false);
      handleBackToHome();
    }, 3000);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header
            onLoginClick={() => setShowAuth(true)}
            onCartClick={() => setShowCart(true)}
            onProfileClick={() => setShowProfile(true)}
            onLogoClick={handleBackToHome}
          />

          <main className="flex-1">
            {currentView === 'home' && <HomePage onRestaurantClick={handleRestaurantClick} />}
            {currentView === 'restaurant' && selectedRestaurantId && (
              <RestaurantPage
                restaurantId={selectedRestaurantId}
                onBackClick={handleBackToHome}
              />
            )}
          </main>

          <Footer />

          {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
          {showCart && (
            <CartPage
              onClose={() => setShowCart(false)}
              onCheckout={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
            />
          )}
          {showCheckout && (
            <CheckoutPage
              onClose={() => setShowCheckout(false)}
              onSuccess={handleCheckoutSuccess}
            />
          )}
          {showProfile && (
            <ProfilePage
              onClose={() => setShowProfile(false)}
              onOpenCart={() => {
                setShowProfile(false);
                setShowCart(true);
              }}
            />
          )}

          {showOrderSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 text-center max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600">Your delicious food is on its way</p>
              </div>
            </div>
          )}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
