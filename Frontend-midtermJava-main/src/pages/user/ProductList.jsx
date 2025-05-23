import { Typography, Input, Select, Button, Row, Col, message, Pagination, Space } from 'antd';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const ProductList = () => {
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        name: '',
        minPrice: '',
        maxPrice: '',
        page: 0,
        size: 12,
        sort: 'price,desc',
    });
    const [searchInput, setSearchInput] = useState('');
    const searchInputRef = useRef(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        fetchProducts();
    }, [filters]);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchInput]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        const queryParams = new URLSearchParams({
            ...(filters.category && { category: filters.category }),
            ...(filters.brand && { brand: filters.brand }),
            ...(filters.name && { name: filters.name }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            page: filters.page,
            size: filters.size,
            sort: filters.sort,
        }).toString();

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?${queryParams}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            const data = response.data;
            if (!data?.data?.content || !Array.isArray(data.data.content)) {
                throw new Error('Dữ liệu sản phẩm không hợp lệ');
            }
            setProducts(data.data.content);
            setPagination({
                currentPage: data.data.pageable?.pageNumber || 0,
                pageSize: data.data.pageable?.pageSize || 12,
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.message || 'Lỗi khi tải sản phẩm');
            setProducts([]);
            setPagination({
                currentPage: 0,
                pageSize: 12,
                totalElements: 0,
                totalPages: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            setFilters(prev => ({ ...prev, name: value, page: 0 }));
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
    };

    const handlePageChange = (page, pageSize) => {
        setFilters(prev => ({ ...prev, page: page - 1, size: pageSize }));
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
                { headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true }
            );
            message.success('Đã thêm vào giỏ hàng!');
            updateCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.data?.message === 'Access Denied') {
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                logout();
            } else {
                message.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Lỗi server'}`);
            }
        }
    };

    const getImageUrl = (image) => (!image ? 'https://via.placeholder.com/150?text=No+Image' : `${import.meta.env.VITE_UPLOADS_URL}/${image}`);

    if (error) return <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>{error}</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <Title level={2} style={{ color: '#1a1a1a', marginBottom: '24px' }}>Tìm kiếm sản phẩm</Title>
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e8e8e8',
                }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} lg={8}>
                        <Input
                            ref={searchInputRef}
                            size="large"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchInput}
                            onChange={handleSearchChange}
                            prefix={<SearchOutlined style={{ color: '#888' }} />}
                            style={{
                                borderRadius: '8px',
                                borderColor: '#d9d9d9',
                                padding: '10px 14px',
                                fontSize: '16px',
                            }}
                        />
                    </Col>
                    <Col xs={24} lg={4}>
                        <Select
                            size="large"
                            placeholder="Danh mục"
                            value={filters.category || undefined}
                            onChange={(value) => handleFilterChange('category', value)}
                            style={{ width: '100%', borderRadius: '8px' }}
                            allowClear
                            dropdownStyle={{ borderRadius: '8px' }}
                        >
                            <Option value="Mỏng nhẹ">Mỏng nhẹ</Option>
                            <Option value="Doanh nhân">Doanh nhân</Option>
                            <Option value="Sinh viên - Văn phòng">Sinh viên - Văn phòng</Option>
                            <Option value="Gaming - Đồ họa">Gaming - Đồ họa</Option>
                        </Select>
                    </Col>
                    <Col xs={24} lg={4}>
                        <Select
                            size="large"
                            placeholder="Thương hiệu"
                            value={filters.brand || undefined}
                            onChange={(value) => handleFilterChange('brand', value)}
                            style={{ width: '100%', borderRadius: '8px' }}
                            allowClear
                            dropdownStyle={{ borderRadius: '8px' }}
                        >
                            <Option value="Dell">Dell</Option>
                            <Option value="Apple">Apple</Option>
                            <Option value="ASUS">ASUS</Option>
                            <Option value="Acer">Acer</Option>
                            <Option value="Lenovo">Lenovo</Option>
                        </Select>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                size="large"
                                placeholder="Giá tối thiểu"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                style={{ width: '50%', borderRadius: '8px 0 0 8px' }}
                                type="number"
                            />
                            <Input
                                size="large"
                                placeholder="Giá tối đa"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                style={{ width: '50%', borderRadius: '0 8px 8px 0' }}
                                type="number"
                            />
                        </Space.Compact>
                    </Col>
                    <Col xs={24} lg={4}>
                        <Select
                            size="large"
                            placeholder="Sắp xếp"
                            value={filters.sort}
                            onChange={(value) => handleFilterChange('sort', value)}
                            style={{ width: '100%', borderRadius: '8px' }}
                            dropdownStyle={{ borderRadius: '8px' }}
                        >
                            <Option value="price,desc">Giá: Cao đến thấp</Option>
                            <Option value="price,asc">Giá: Thấp đến cao</Option>
                            <Option value="name,asc">Tên: A-Z</Option>
                            <Option value="name,desc">Tên: Z-A</Option>
                        </Select>
                    </Col>
                    <Col xs={24} lg={4}>
                        <Button
                            size="large"
                            type="primary"
                            onClick={fetchProducts}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                background: '#1890ff',
                                borderColor: '#1890ff',
                                fontWeight: '500',
                            }}
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                </Row>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '48px', fontSize: '16px', color: '#888' }}>Đang tải...</div>}
            {!loading && products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', fontSize: '16px', color: '#888' }}>
                    Không tìm thấy sản phẩm phù hợp.
                </div>
            ) : (
                !loading && (
                    <>
                        <Row gutter={[24, 24]}>
                            {products.map((product) => (
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
                                                        icon={<EyeOutlined />}
                                                        style={{ borderRadius: '8px', fontWeight: '500' }}
                                                    />
                                                </Link>
                                                <Button
                                                    onClick={() => handleAddToCart(product.id)}
                                                    icon={<ShoppingCartOutlined />}
                                                    style={{
                                                        borderRadius: '8px',
                                                        background: '#52c41a',
                                                        borderColor: '#52c41a',
                                                        color: '#fff',
                                                        fontWeight: '500',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <Pagination
                                current={pagination.currentPage + 1}
                                pageSize={pagination.pageSize}
                                total={pagination.totalElements}
                                onChange={handlePageChange}
                                showSizeChanger
                                pageSizeOptions={['12', '24', '36']}
                                disabled={loading}
                                style={{ fontSize: '16px' }}
                            />
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default ProductList;