import { Typography, Row, Col, message, Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosConfig.js';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from './ProductCard';

const { Title, Paragraph } = Typography;

const Home = () => {
    const { user } = useAuth();
    const [newestProducts, setNewestProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const newestCarouselRef = useRef(null);
    const bestSellingCarouselRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const newestResponse = await axiosInstance.get('/api/products/search?page=0&size=8&sort=views,desc');
            const newestProducts = newestResponse.data.data.content;

            const bestSellingResponse = await axiosInstance.get('/api/products/search?page=0&size=8&sort=price,desc');
            const bestSellingProducts = bestSellingResponse.data.data.content;

            setNewestProducts(newestProducts);
            setBestSellingProducts(bestSellingProducts);
            setLoading(false);
        } catch (error) {
            console.log('Lỗi khi lấy sản phẩm:', error.response || error.message);
            setLoading(false);
        }
    };

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

    return (
        <div
            style={{
                padding: '24px',
                maxWidth: '1400px',
                margin: '0 auto',
                background: '#fff',
                boxSizing: 'border-box',
            }}
        >
            <Title
                level={2}
                style={{
                    color: '#1a1a1a',
                    textAlign: 'center',
                    marginBottom: '16px',
                    fontSize: 'clamp(24px, 5vw, 32px)',
                }}
            >
                Chào mừng đến với XShop
            </Title>
            <Paragraph
                style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    color: '#888',
                    fontSize: 'clamp(14px, 4vw, 16px)',
                }}
            >
                Khám phá bộ sưu tập sản phẩm đa dạng và chất lượng của chúng tôi!
            </Paragraph>

            {/* Sản phẩm mới nhất */}
            <div style={{ marginBottom: '48px' }}>
                <Title
                    level={3}
                    style={{
                        marginBottom: '24px',
                        color: '#1a1a1a',
                        fontSize: 'clamp(20px, 4vw, 24px)',
                    }}
                >
                    Sản phẩm mới nhất
                </Title>
                <div style={{ position: 'relative' }}>
                    <Carousel
                        ref={newestCarouselRef}
                        dots={false}
                        slidesToShow={1}
                        slidesToScroll={1}
                    >
                        {chunkProducts(newestProducts, 4).map((chunk, index) => (
                            <div key={`newest-${index}`}>
                                {renderProductRow(chunk)}
                            </div>
                        ))}
                    </Carousel>
                    <ArrowButton
                        direction="left"
                        onClick={() => newestCarouselRef.current.prev()}
                    />
                    <ArrowButton
                        direction="right"
                        onClick={() => newestCarouselRef.current.next()}
                    />
                </div>
            </div>

            {/* Sản phẩm được mua nhiều nhất */}
            <div>
                <Title
                    level={3}
                    style={{
                        marginBottom: '24px',
                        color: '#1a1a1a',
                        fontSize: 'clamp(20px, 4vw, 24px)',
                    }}
                >
                    Sản phẩm được mua nhiều nhất
                </Title>
                <div style={{ position: 'relative' }}>
                    <Carousel
                        ref={bestSellingCarouselRef}
                        dots={false}
                        slidesToShow={1}
                        slidesToScroll={1}
                    >
                        {chunkProducts(bestSellingProducts, 4).map((chunk, index) => (
                            <div key={`bestselling-${index}`}>
                                {renderProductRow(chunk)}
                            </div>
                        ))}
                    </Carousel>
                    <ArrowButton
                        direction="left"
                        onClick={() => bestSellingCarouselRef.current.prev()}
                    />
                    <ArrowButton
                        direction="right"
                        onClick={() => bestSellingCarouselRef.current.next()}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;