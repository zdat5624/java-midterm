import { Typography, Button, Image, message, Row, Col, Divider, InputNumber, Carousel } from 'antd';
import { LeftOutlined, RightOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoginModal from '../../components/LoginModal';
import ProductCard from './ProductCard';

const { Title, Paragraph } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const thumbnailContainerRef = useRef(null);
    const similarCarouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const fetchProductAndSimilar = async () => {
            try {
                // Lấy chi tiết sản phẩm
                const productResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                });
                const productData = productResponse.data.data;
                setProduct(productData);
                setSelectedImage(productData?.images?.[0] || null);

                // Lấy sản phẩm tương tự
                const similarResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/products/${id}/similar?page=0&size=8&sort=views,desc`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        withCredentials: true,
                    }
                );
                const similarProductsData = similarResponse.data.data.content;
                setSimilarProducts(similarProductsData);

                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error.response?.data || error.message);
                setLoading(false);
            }
        };
        fetchProductAndSimilar();
    }, [id, token]);

    const handleAddToCart = async () => {
        if (!user) {
            setIsModalVisible(true);
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/cart/add`,
                { productId: id, quantity },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            updateCart();
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error.response?.data || error.message);
            if (error.response?.data?.message === 'Access Denied') {
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                logout();
                setIsModalVisible(true);
            } else {
                message.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Lỗi server'}`);
            }
        }
    };

    const handleLoginSuccess = () => {
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
        setSelectedImage(product.images[index]);
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

    const handleDragStart = (clientX) => {
        if (!thumbnailContainerRef.current) return;
        setIsDragging(true);
        const rect = thumbnailContainerRef.current.getBoundingClientRect();
        const paddingLeft = 4;
        setStartX(clientX - rect.left - paddingLeft);
        setScrollLeft(thumbnailContainerRef.current.scrollLeft);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        handleDragStart(e.touches[0].clientX);
    };

    const handleDragMove = (clientX) => {
        if (!isDragging || !thumbnailContainerRef.current) return;
        const rect = thumbnailContainerRef.current.getBoundingClientRect();
        const paddingLeft = 4;
        const x = clientX - rect.left - paddingLeft;
        const walk = (x - startX) * 1.2;
        thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        handleDragMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleKeyDown = (e) => {
        const allowedKeys = [
            'Backspace',
            'Delete',
            'Tab',
            'Enter',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
        ];
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const numbersOnly = pastedText.replace(/[^0-9]/g, '');
        if (numbersOnly) {
            const parsedValue = Math.max(1, parseInt(numbersOnly, 10));
            setQuantity(parsedValue);
        }
    };

    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const preventDefault = (e) => {
                if (isDragging) e.preventDefault();
            };
            container.addEventListener('touchmove', preventDefault, { passive: false });
            return () => container.removeEventListener('touchmove', preventDefault);
        }
    }, [isDragging]);

    const getImageUrl = (image) => {
        return image ? `${import.meta.env.VITE_UPLOADS_URL}/${image}` : 'https://via.placeholder.com/150?text=No+Image';
    };

    const chunkProducts = (products, size) => {
        const chunks = [];
        for (let i = 0; i < products.length; i += size) {
            chunks.push(products.slice(i, i + size));
        }
        return chunks;
    };

    const renderProductRow = (products) => (
        <Row gutter={[24, 24]}>
            {products.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <ProductCard product={product} getImageUrl={getImageUrl} />
                </Col>
            ))}
        </Row>
    );

    const ArrowButton = ({ direction, onClick }) => (
        <Button
            shape="circle"
            icon={direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                [direction]: '-40px',
                zIndex: 10,
                background: '#fff',
                borderColor: '#d9d9d9',
                color: '#1a1a1a',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = '#52c41a';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#52c41a';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#1a1a1a';
                e.currentTarget.style.borderColor = '#d9d9d9';
            }}
        />
    );

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '16px', color: '#888' }}>Đang tải...</div>;

    if (!product) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '16px', color: '#888' }}>Không tìm thấy sản phẩm.</div>;

    return (
        <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
            <Row gutter={[24, 24]}>
                <Col xs={24}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Row gutter={[64, 16]}>
                            <Col xs={24} md={12}>
                                <div style={{ position: 'relative' }}>
                                    {selectedImage ? (
                                        <Image
                                            src={getImageUrl(selectedImage)}
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
                                                    borderRadius: '50%',
                                                    padding: 8,
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
                                                    borderRadius: '50%',
                                                    padding: 8,
                                                }}
                                                onClick={handleNextImage}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 10,
                                                    right: 10,
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {currentImageIndex + 1}/{product.images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div
                                    ref={thumbnailContainerRef}
                                    style={{
                                        overflowX: 'auto',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        marginTop: 16,
                                        padding: '0 4px',
                                        cursor: isDragging ? 'grabbing' : 'grab',
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleDragEnd}
                                    onMouseLeave={handleDragEnd}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleDragEnd}
                                >
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {product.images && product.images.length > 0 ? (
                                            product.images.map((image, index) => (
                                                <div key={index} style={{ flexShrink: 0 }}>
                                                    <Image
                                                        src={getImageUrl(image)}
                                                        width={80}
                                                        height={80}
                                                        style={{
                                                            objectFit: 'contain',
                                                            cursor: 'pointer',
                                                            border: selectedImage === image ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                            borderRadius: 4,
                                                            background: '#fff',
                                                        }}
                                                        preview={false}
                                                        onClick={() => handleThumbnailClick(index)}
                                                        onError={(e) => {
                                                            console.log('Lỗi tải hình ảnh:', image);
                                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                        }}
                                                    />
                                                </div>
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
                                                    background: '#fff',
                                                }}
                                            />
                                        )}
                                    </div>
                                    <style>
                                        {`
                      div[ref="thumbnailContainerRef"]::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                                    </style>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div style={{ padding: '16px 0' }}>
                                    <Title level={2} style={{ marginBottom: 16 }}>{product.name}</Title>
                                    <Paragraph style={{ marginBottom: 8 }}>
                                        {product.shortDescription}
                                    </Paragraph>
                                    <Paragraph strong style={{ fontSize: 20, color: '#ff4d4f', marginBottom: 8 }}>
                                        {product.price.toLocaleString()} VNĐ
                                    </Paragraph>
                                    <Paragraph style={{ marginBottom: 8 }}>
                                        <strong>Thương hiệu:</strong> {product.brand}
                                    </Paragraph>
                                    <Paragraph style={{ marginBottom: 16 }}>
                                        <strong>Danh mục:</strong> {product.category}
                                    </Paragraph>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                        <span>Số lượng:</span>
                                        <InputNumber
                                            min={1}
                                            value={quantity}
                                            onChange={(value) => setQuantity(value || 1)}
                                            onKeyDown={handleKeyDown}
                                            onPaste={handlePaste}
                                            size="large"
                                            parser={(value) => {
                                                const parsed = value.replace(/[^0-9]/g, '');
                                                return parsed ? Math.max(1, parseInt(parsed, 10)) : 1;
                                            }}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            style={{ width: 100 }}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAddToCart}
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
                                            padding: '0 24px',
                                            height: 40,
                                        }}
                                        icon={<ShoppingCartOutlined />}
                                        size="large"
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
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col xs={24}>
                    <div
                        style={{
                            background: '#fff',
                            padding: 24,
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            marginTop: 16,
                            border: '1px solid #e8e8e8',
                        }}
                    >
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
                {similarProducts.length > 0 && (
                    <Col xs={24}>
                        <div
                            style={{
                                background: '#fff',
                                padding: 24,
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                marginTop: 16,
                                border: '1px solid #e8e8e8',
                            }}
                        >
                            <Title
                                level={3}
                                style={{
                                    marginBottom: '24px',
                                    color: '#1a1a1a',
                                    fontSize: 'clamp(20px, 4vw, 24px)',
                                }}
                            >
                                Sản phẩm tương tự
                            </Title>
                            <div style={{ position: 'relative' }}>
                                <Carousel
                                    ref={similarCarouselRef}
                                    dots={false}
                                    slidesToShow={1}
                                    slidesToScroll={1}
                                >
                                    {chunkProducts(similarProducts, 4).map((chunk, index) => (
                                        <div key={`similar-${index}`}>
                                            {renderProductRow(chunk)}
                                        </div>
                                    ))}
                                </Carousel>
                                <ArrowButton
                                    direction="left"
                                    onClick={() => similarCarouselRef.current.prev()}
                                />
                                <ArrowButton
                                    direction="right"
                                    onClick={() => similarCarouselRef.current.next()}
                                />
                            </div>
                        </div>
                    </Col>
                )}
            </Row>
            <LoginModal
                visible={isModalVisible}
                onCancel={handleModalCancel}
                onSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default ProductDetail;