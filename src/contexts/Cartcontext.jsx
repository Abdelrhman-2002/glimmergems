import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './Authcontext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Load cart from localStorage on component mount
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Watch for user logout and clear cart when that happens
  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [currentUser]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    // Check if user is logged in
    if (!currentUser) {
      setErrorMessage('Please log in to add items to your cart');
      return false;
    }
    
    setCartItems(prevItems => {
      // Check if product already in cart
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // Update quantity if product already exists
        return prevItems.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
    
    setErrorMessage(null);
    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getCartTotal,
      errorMessage,
      setErrorMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};