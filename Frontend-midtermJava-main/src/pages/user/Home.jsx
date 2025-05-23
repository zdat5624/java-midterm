import { Typography, Row, Col, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Title, Paragraph } = Typography;

const Home = () => {
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [newestProducts, setNewestProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search`, {
                params: {
                    page: 0,
                    size: 20,
                },
            });
            const products = response.data.data.content;

            const sortedNewest = [...products].sort((a, b) => a.views - b.views).slice(0, 4);
            const sortedBestSelling = [...products].sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 4);

            setNewestProducts(sortedNewest);
            setBestSellingProducts(sortedBestSelling);
            setLoading(false);
        } catch (error) {
            console.log('Lỗi khi lấy sản phẩm:', error.response || error.message);
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
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
            } else {
                message.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Lỗi server'}`);
            }
        }
    };

    const getImageUrl = (image) => {
        return image ? `${import.meta.env.VITE_UPLOADS_URL}/${image}` : 'https://via.placeholder.com/150?text=No+Image';
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '16px', color: '#888' }}>Đang tải...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#fff' }}>
            <Title level={2} style={{ color: '#1a1a1a', textAlign: 'center', marginBottom: '16px' }}>
                Welcome to Shop MVP
            </Title>
            <Paragraph style={{ textAlign: 'center', marginBottom: '32px', color: '#888', fontSize: '16px' }}>
                Explore our wide range of products!
            </Paragraph>

            {/* Sản phẩm mới nhất */}
            <div style={{ marginBottom: '48px' }}>
                <Title level={3} style={{ marginBottom: '24px', color: '#1a1a1a' }}>
                    Sản phẩm mới nhất
                </Title>
                <Row gutter={[24, 24]}>
                    {newestProducts.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                            <div
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    background: '#fff',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                    ':hover': { transform: 'translateY(-4px)' },
                                }}
                            >
                                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        alt={product.name || 'Sản phẩm'}
                                        src={getImageUrl(product.images?.[0])}
                                        style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                    />
                                </div>
                                <div style={{ padding: '0 24px 24px' }}>
                                    <div
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            height: '48px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: '#1a1a1a',
                                        }}
                                    >
                                        {product.name || 'Không có tên'}
                                    </div>
                                    <div>
                                        <p style={{ margin: '8px 0', color: '#ff4d4f', fontWeight: '600', fontSize: '16px' }}>
                                            {(product.price || 0).toLocaleString()} VNĐ
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#888', fontSize: '14px' }}>
                                            Danh mục: {product.category || 'N/A'}
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#888', fontSize: '14px' }}>
                                            Thương hiệu: {product.brand || 'N/A'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                        <Link to={`/products/${product.id}`}>
                                            <Button
                                                type="primary"
                                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={() => handleAddToCart(product.id)}
                                            style={{
                                                borderRadius: '8px',
                                                background: '#52c41a',
                                                borderColor: '#52c41a',
                                                color: '#fff',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Sản phẩm được mua nhiều nhất */}
            <div>
                <Title level={3} style={{ marginBottom: '24px', color: '#1a1a1a' }}>
                    Sản phẩm được mua nhiều nhất
                </Title>
                <Row gutter={[24, 24]}>
                    {bestSellingProducts.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                            <div
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    background: '#fff',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                    ':hover': { transform: 'translateY(-4px)' },
                                }}
                            >
                                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        alt={product.name || 'Sản phẩm'}
                                        src={getImageUrl(product.images?.[0])}
                                        style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                    />
                                </div>
                                <div style={{ padding: '0 24px 24px' }}>
                                    <div
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            height: '48px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: '#1a1a1a',
                                        }}
                                    >
                                        {product.name || 'Không có tên'}
                                    </div>
                                    <div>
                                        <p style={{ margin: '8px 0', color: '#ff4d4f', fontWeight: '600', fontSize: '16px' }}>
                                            {(product.price || 0).toLocaleString()} VNĐ
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#888', fontSize: '14px' }}>
                                            Danh mục: {product.category || 'N/A'}
                                        </p>
                                        <p style={{ margin: '4px 0', color: '#888', fontSize: '14px' }}>
                                            Thương hiệu: {product.brand || 'N/A'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                        <Link to={`/products/${product.id}`}>
                                            <Button
                                                type="primary"
                                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={() => handleAddToCart(product.id)}
                                            style={{
                                                borderRadius: '8px',
                                                background: '#52c41a',
                                                borderColor: '#52c41a',
                                                color: '#fff',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default Home;