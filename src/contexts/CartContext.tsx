import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Cart, CartItem, MenuItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  cartItemsCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (restaurantId: string, menuItem: MenuItem, quantity?: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (cartError) throw cartError;

      if (cartData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('cart_items')
          .select(`
            *,
            menu_item:menu_items(*)
          `)
          .eq('cart_id', cartData.id);

        if (itemsError) throw itemsError;

        setCart({
          ...cartData,
          items: itemsData || [],
        });
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (restaurantId: string, menuItem: MenuItem, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      if (cart && cart.restaurant_id !== restaurantId) {
        const confirm = window.confirm(
          'Your cart contains items from another restaurant. Clear cart and add this item?'
        );
        if (!confirm) return;
        await clearCart();
      }

      let cartId = cart?.id;

      if (!cartId) {
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert([
            {
              user_id: user.id,
              restaurant_id: restaurantId,
            },
          ])
          .select()
          .single();

        if (cartError) throw cartError;
        cartId = newCart.id;
      }

      const existingItem = cart?.items.find(item => item.menu_item_id === menuItem.id);

      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([
            {
              cart_id: cartId,
              menu_item_id: menuItem.id,
              quantity,
            },
          ]);

        if (error) throw error;
      }

      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      await refreshCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cart.id);

      if (error) throw error;

      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  ) || 0;

  const value = {
    cart,
    cartItemsCount,
    cartTotal,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
