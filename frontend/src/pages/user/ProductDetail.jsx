import { Typography, Button, Image, message, Row, Col, Space, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Title, Paragraph } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                });
                const data = response.data;
                console.log('Dữ liệu sản phẩm:', data);
                setProduct(data.data);
                setSelectedImage(data.data?.images?.[0] || null);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error.response?.data || error.message);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, token]);

    const handleAddToCart = async () => {
        if (!user) {
            message.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/cart/add`,
                { productId: id, quantity: 1 },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success('Đã thêm vào giỏ hàng!');
            console.log('Phản hồi giỏ hàng:', response.data);
            updateCart();
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error.response?.data || error.message);
            if (error.response?.data?.message === 'Access Denied') {
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                logout();
            } else {
                message.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Lỗi server'}`);
            }
        }
    };

    const handlePrevImage = () => {
        if (product?.images?.length > 0) {
            const newIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
            setCurrentImageIndex(newIndex);
            setSelectedImage(product.images[newIndex]);
        }
    };

    const handleNextImage = () => {
        if (product?.images?.length > 0) {
            const newIndex = (currentImageIndex + 1) % product.images.length;
            setCurrentImageIndex(newIndex);
            setSelectedImage(product.images[newIndex]);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    if (!product) return <div>Không tìm thấy sản phẩm.</div>;

    return (
        <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
            <Row gutter={[24, 24]}>
                {/* Hình ảnh chính */}
                <Col xs={24} md={14}>
                    <div style={{ position: 'relative' }}>
                        {selectedImage ? (
                            <Image
                                src={`${import.meta.env.VITE_UPLOADS_URL}/${selectedImage}`}
                                width="100%"
                                height={450}
                                style={{
                                    objectFit: 'contain',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 8,
                                    padding: 16,
                                    background: '#fff',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                                onError={(e) => {
                                    console.log('Lỗi tải hình ảnh:', selectedImage);
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                }}
                            />
                        ) : (
                            <Image
                                src="https://via.placeholder.com/150?text=No+Image"
                                width="100%"
                                height={450}
                                style={{
                                    objectFit: 'contain',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 8,
                                    padding: 16,
                                    background: '#fff',
                                }}
                            />
                        )}
                        {product?.images?.length > 1 && (
                            <>
                                <Button
                                    icon={<LeftOutlined />}
                                    style={{
                                        position: 'absolute',
                                        left: 10,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
                                        border: 'none',
                                    }}
                                    onClick={handlePrevImage}
                                />
                                <Button
                                    icon={<RightOutlined />}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
                                        border: 'none',
                                    }}
                                    onClick={handleNextImage}
                                />
                            </>
                        )}
                    </div>
                </Col>

                {/* Thông tin sản phẩm (tên, giá, thương hiệu, danh mục) */}
                <Col xs={24} md={10}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Title level={2} style={{ marginBottom: 16 }}>{product.name}</Title>
                        <Paragraph strong style={{ fontSize: 20, color: '#ff4d4f', marginBottom: 8 }}>
                            Giá: {product.price.toLocaleString()} VNĐ
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 8 }}>
                            <strong>Thương hiệu:</strong> {product.brand}
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 16 }}>
                            <strong>Danh mục:</strong> {product.category}
                        </Paragraph>
                        <Button type="primary" size="large" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </Button>
                    </div>
                </Col>

                {/* Hình ảnh phụ (thumbnails) */}
                <Col xs={24} md={14}>
                    <div style={{ position: 'relative', marginTop: 16, textAlign: 'center' }}>
                        <Space direction="horizontal" size={12}>
                            {product.images && product.images.length > 0 ? (
                                product.images.map((image, index) => (
                                    <Image
                                        key={index}
                                        src={`${import.meta.env.VITE_UPLOADS_URL}/${image}`}
                                        width={80}
                                        height={80}
                                        style={{
                                            objectFit: 'contain',
                                            cursor: 'pointer',
                                            border: selectedImage === image ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            borderRadius: 4,
                                            padding: 4,
                                            background: '#fff',
                                            display: 'inline-block',
                                        }}
                                        preview={false}
                                        onClick={() => {
                                            setSelectedImage(image);
                                            setCurrentImageIndex(index);
                                        }}
                                        onError={(e) => {
                                            console.log('Lỗi tải hình ảnh:', image);
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                ))
                            ) : (
                                <Image
                                    src="https://via.placeholder.com/150?text=No+Image"
                                    width={80}
                                    height={80}
                                    style={{ 
                                        objectFit: 'contain', 
                                        border: '1px solid #d9d9d9', 
                                        borderRadius: 4,
                                        display: 'inline-block',
                                    }}
                                />
                            )}
                        </Space>
                        {product?.images?.length > 1 && (
                            <>
                                <Button
                                    icon={<LeftOutlined />}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
                                        border: 'none',
                                    }}
                                    onClick={handlePrevImage}
                                />
                                <Button
                                    icon={<RightOutlined />}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
                                        border: 'none',
                                    }}
                                    onClick={handleNextImage}
                                />
                            </>
                        )}
                    </div>
                </Col>

                {/* Mô tả */}
                <Col xs={24}>
                    <div style={{ 
                        background: '#fff', 
                        padding: 24, 
                        borderRadius: 8, 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                        marginTop: 16,
                        border: '1px solid #e8e8e8',
                    }}>
                        <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
                            Mô tả sản phẩm
                        </Title>
                        <Divider style={{ margin: '16px 0' }} />
                        {product.detailedDescription.split('\n').map((line, index) => (
                            <Paragraph 
                                key={index} 
                                style={{ 
                                    marginBottom: 12, 
                                    lineHeight: 1.8, 
                                    color: '#333',
                                    textAlign: 'justify',
                                }}
                            >
                                {line}
                            </Paragraph>
                        ))}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ProductDetail;