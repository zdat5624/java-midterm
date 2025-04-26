import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cartItemCount, setCartItemCount] = useState(0);

    const fetchCart = async () => {
        try {
            const response = await axiosInstance.get('/api/cart');
            if (response.data.statusCode === 200 && response.data.data?.items) {
                const totalItems = response.data.data.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                setCartItemCount(totalItems);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCartItemCount(0);
        }
    }, [isAuthenticated]);

    const updateCart = () => {
        if (isAuthenticated) {
            fetchCart(); // Gọi lại API để cập nhật số lượng
        }
    };

    return (
        <CartContext.Provider value={{ cartItemCount, updateCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);