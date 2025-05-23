import { Button, Card, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { useState } from 'react';
import LoginModal from '../../components/LoginModal';

const ProductCard = ({ product, getImageUrl }) => {
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddToCart = async (productId) => {
        if (!user) {
            setIsModalVisible(true); // Mở modal nếu chưa đăng nhập
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/cart/add`,
                { productId, quantity: 1 },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success('Đã thêm vào giỏ hàng!');
            updateCart();
        } catch (error) {
            console.error('Error adding to cart:', error.response?.data || error.message);
            if (error.response?.data?.message === 'Access Denied') {
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                logout();
                setIsModalVisible(true); // Mở lại modal nếu token hết hạn
            } else {
                message.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Lỗi server'}`);
            }
        }
    };

    const handleLoginSuccess = () => {
        setIsModalVisible(false); // Đóng modal sau khi đăng nhập thành công
        // message.success('Đăng nhập thành công! Vui lòng thử lại thao tác.');
    };

    const handleModalCancel = () => {
        setIsModalVisible(false); // Đóng modal khi hủy
    };

    return (
        <>
            <Card
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    background: '#fff',
                    overflow: 'hidden',
                }}
                bodyStyle={{ padding: '16px' }}
            >
                <Link to={`/products/${product.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            alt={product.name || 'Sản phẩm'}
                            src={getImageUrl(product.images?.[0])}
                            style={{ height: '150px', objectFit: 'contain', borderRadius: '8px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                    </div>
                    <div
                        style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#1a1a1a',
                            marginTop: '16px',
                            textAlign: 'center',
                        }}
                    >
                        {product.name || 'Không có tên'}
                    </div>
                    <div
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#1a1a1a',
                            marginTop: '8px',
                            textAlign: 'center',
                        }}
                    >
                        {product.shortDescription || 'Không có mô tả'}
                    </div>
                </Link>
                <div>
                    <p
                        style={{
                            margin: '8px 0',
                            color: '#ff4d4f',
                            fontWeight: '600',
                            fontSize: '16px',
                            textAlign: 'center',
                        }}
                    >
                        {(product.price || 0).toLocaleString()} VNĐ
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product.id);
                            }}
                            style={{
                                borderRadius: '8px',
                                background: '#52c41a',
                                borderColor: '#52c41a',
                                color: '#fff',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                transform: 'scale(1)',
                            }}
                            icon={<ShoppingCartOutlined />}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#3f9c14';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#52c41a';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            Thêm vào giỏ
                        </Button>
                    </div>
                </div>
            </Card>
            <LoginModal
                visible={isModalVisible}
                onCancel={handleModalCancel}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
};

export default ProductCard;