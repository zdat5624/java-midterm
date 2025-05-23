import { Typography, Row, Col, message, Pagination, Spin } from 'antd';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';
import SearchAndFilter from '../../components/SearchAndFilter';

const { Title, Text } = Typography;

const ProductList = () => {
    console.log('ProductList rendered');
    const { user, token, logout } = useAuth();
    const { updateCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 9,
        totalElements: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        categoryId: null,
        brandId: null,
        name: '',
        priceRange: [0, 150],
        page: 0,
        size: 9,
        sort: 'price,desc',
    });
    const [searchInput, setSearchInput] = useState('');
    const searchInputRef = useRef(null);
    const isMounted = useRef(false);

    // Memoize priceRange to prevent new array reference
    const memoizedPriceRange = useMemo(() => filters.priceRange, [filters.priceRange]);

    // Calculate pagination range
    const paginationRange = useMemo(() => {
        const start = pagination.currentPage * pagination.pageSize + 1;
        const end = Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements);
        const total = pagination.totalElements;
        console.log('Pagination range:', { start, end, total });
        return { range: [start, end], total };
    }, [pagination.currentPage, pagination.pageSize, pagination.totalElements]);

    // Focus search input on mount only
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.brandId && { brandId: filters.brandId }),
                ...(filters.name && { name: filters.name }),
                ...(filters.priceRange[0] > 0 && { minPrice: filters.priceRange[0] * 1_000_000 }),
                ...(filters.priceRange[1] < 150 && { maxPrice: filters.priceRange[1] * 1_000_000 }),
                page: filters.page,
                size: filters.size,
                sort: filters.sort,
            }).toString();

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
                pageSize: data.data.pageable?.pageSize || 9,
                totalElements: data.data.totalElements || 0,
                totalPages: data.data.totalPages || 0,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.message || 'Lỗi khi tải sản phẩm.');
            setProducts([]);
            setPagination({
                currentPage: 0,
                pageSize: 9,
                totalElements: 0,
                totalPages: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [filters, token]);

    // Handle filter changes
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchChange = useCallback((value, isSearchTriggered) => {
        console.log('ProductList handleSearchChange:', { value, isSearchTriggered });
        setSearchInput(value);
        if (isSearchTriggered) {
            setFilters(prev => ({ ...prev, name: value, page: 0 }));
        }
    }, []);

    const handleCategoryChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, categoryId: e.target.value, page: 0 }));
    }, []);

    const handleBrandChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, brandId: e.target.value, page: 0 }));
    }, []);

    const handlePriceRangeChange = useCallback((value) => {
        setFilters(prev => ({ ...prev, priceRange: value, page: 0 }));
    }, []);

    const handlePageChange = useCallback((page, pageSize) => {
        setFilters(prev => ({ ...prev, page: page - 1, size: pageSize }));
    }, []);

    const handleResetPrice = useCallback(() => {
        setFilters(prev => ({ ...prev, priceRange: [0, 150], page: 0 }));
    }, []);

    const handleResetAll = useCallback(() => {
        setFilters({
            categoryId: null,
            brandId: null,
            name: '',
            priceRange: [0, 150],
            page: 0,
            size: 9,
            sort: 'price,desc',
        });
        setSearchInput('');
    }, []);

    const setSort = useCallback((value) => {
        setFilters(prev => ({ ...prev, sort: value, page: 0 }));
    }, []);



    const getImageUrl = useCallback((image) => (
        !image ? 'https://via.placeholder.com/150?text=No+Image' : `${import.meta.env.VITE_UPLOADS_URL}/${image}`
    ), []);

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={6}>
                    <SearchAndFilter
                        categoryId={filters.categoryId}
                        brandId={filters.brandId}
                        name={filters.name}
                        priceRange={memoizedPriceRange}
                        sort={filters.sort}
                        setSort={setSort}
                        loading={loading}
                        searchInput={searchInput}
                        handleSearchChange={handleSearchChange}
                        handleCategoryChange={handleCategoryChange}
                        handleBrandChange={handleBrandChange}
                        handlePriceRangeChange={handlePriceRangeChange}
                        handleResetPrice={handleResetPrice}
                        handleResetAll={handleResetAll}
                        fetchProducts={fetchProducts}
                        searchInputRef={searchInputRef}
                    />
                </Col>
                <Col xs={24} lg={18}>
                    <div className="transition-opacity duration-300">
                        {loading ? (
                            <div className="text-center p-12">
                                <Spin tip="Đang tải sản phẩm..." size="large" />
                            </div>
                        ) : error ? (
                            <div className="text-center p-12 text-red-500 text-lg">{error}</div>
                        ) : products.length === 0 ? (
                            <div className="text-center p-12 text-gray-500 text-lg">
                                Không tìm thấy sản phẩm phù hợp.
                            </div>
                        ) : (
                            <>
                                <Row gutter={[24, 24]} className="animate-fade-in">
                                    {products.map((product) => (
                                        <Col xs={24} sm={12} md={8} lg={8} key={product.id}>
                                            <ProductCard
                                                product={product}
                                                getImageUrl={getImageUrl}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                <div className="text-center mt-8">
                                    <Text className="block mb-4 text-gray-600">
                                        Hiển thị {paginationRange.range[0]}-{paginationRange.range[1]} trên {paginationRange.total} sản phẩm
                                    </Text>
                                    <Pagination
                                        current={pagination.currentPage + 1}
                                        pageSize={pagination.pageSize}
                                        total={pagination.totalElements}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        pageSizeOptions={['9', '18', '27']}
                                        disabled={loading}
                                        className="text-lg"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ProductList;