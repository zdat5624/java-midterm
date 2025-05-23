import { useState, useEffect } from 'react';
import { Typography, Table, Button, Input, Select, Row, Col, Space, message, InputNumber, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ShoppingOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import ProductEditModal from '../../components/product/ProductEditModal';
import ProductCreateModal from '../../components/product/ProductCreateModal';
import ProductDetailModal from '../../components/product/ProductDetailModal';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Hàm format tiền Việt Nam
const formatVND = (price) => {
    if (typeof price !== 'number') return '0 đ';
    return price.toLocaleString('vi-VN') + ' đ';
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: ['6', '12', '24'],
        showSizeChanger: true,
    });
    const [filters, setFilters] = useState({
        categoryId: undefined,
        brandId: undefined,
        name: '',
        minPrice: undefined,
        maxPrice: undefined,
        sort: 'price,desc',
    });
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/categories/paged', {
                params: { page: 0, size: 100, sort: 'id,asc' },
            });
            if (response.data.statusCode === 200) {
                setCategories(response.data.data.content);
            } else {
                message.error('Lỗi khi tải danh sách danh mục.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Lỗi khi tải danh sách danh mục.');
        }
    };

    // Fetch brands
    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.get('/api/brands/paged', {
                params: { page: 0, size: 100, sort: 'id,asc' },
            });
            if (response.data.statusCode === 200) {
                setBrands(response.data.data.content);
            } else {
                message.error('Lỗi khi tải danh sách thương hiệu.');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            message.error('Lỗi khi tải danh sách thương hiệu.');
        }
    };

    // Gọi API để lấy danh sách sản phẩm
    const fetchProducts = async (page = 1, pageSize = 6, filters = {}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/products/search', {
                params: {
                    categoryId: filters.categoryId || undefined,
                    brandId: filters.brandId || undefined,
                    name: filters.name || undefined,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                    sort: filters.sort || undefined,
                    page: page - 1,
                    size: pageSize,
                },
            });
            if (response.data.statusCode === 200) {
                setProducts(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                });
            } else {
                message.error('Lỗi khi tải danh sách sản phẩm.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Lỗi khi tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial data
    useEffect(() => {
        fetchCategories();
        fetchBrands();
        fetchProducts(pagination.current, pagination.pageSize, filters);
    }, []);

    // Xử lý thay đổi phân trang và sắp xếp
    const handleTableChange = (newPagination, _, sorter) => {
        const newSort = sorter.order
            ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
            : filters.sort;
        const updatedFilters = { ...filters, sort: newSort };
        setFilters(updatedFilters);
        fetchProducts(newPagination.current, newPagination.pageSize, updatedFilters);
        setPagination(newPagination);
    };

    // Xử lý tìm kiếm theo tên
    const handleSearch = (value) => {
        const newFilters = { ...filters, name: value };
        setFilters(newFilters);
        fetchProducts(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchProducts(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý mở Modal chỉnh sửa
    const handleEditProduct = (productId) => {
        setSelectedProductId(productId);
        setIsEditModalOpen(true);
    };

    // Xử lý mở Modal xem chi tiết
    const handleViewProduct = (productId) => {
        setSelectedProductId(productId);
        setIsDetailModalOpen(true);
    };

    // Xử lý xóa sản phẩm với xác nhận
    const handleDeleteProduct = (productId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await axiosInstance.delete(`/api/products/${productId}`);
                    if (response.status === 204) {
                        message.success('Xóa sản phẩm thành công!');
                        // Check if the current page will be empty after deletion
                        const isLastItemOnPage = products.length === 1 && pagination.total > 0;
                        const newPage = isLastItemOnPage && pagination.current > 1
                            ? pagination.current - 1
                            : pagination.current;
                        fetchProducts(newPage, pagination.pageSize, filters);
                    } else {
                        message.error('Lỗi khi xóa sản phẩm.');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    message.error('Lỗi khi xóa sản phẩm.');
                }
            },
        });
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', sorter: true },
        { title: 'Tên', dataIndex: 'name', key: 'name', sorter: true },
        { title: 'Giá', dataIndex: 'price', key: 'price', sorter: true, render: (price) => formatVND(price) },
        { title: 'Danh mục', dataIndex: 'category', key: 'category', sorter: true },
        { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand', sorter: true },
        { title: 'Lượt xem', dataIndex: 'views', key: 'views', sorter: true },
        { title: 'Đã bán', dataIndex: 'soldQuantity', key: 'soldQuantity', sorter: true },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleViewProduct(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleEditProduct(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteProduct(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <ShoppingOutlined className="mr-2" />Quản lý sản phẩm
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tạo mới
                </Button>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Tìm kiếm theo tên sản phẩm"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Select
                        placeholder="Lọc theo danh mục"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('categoryId', value)}
                        allowClear
                        value={filters.categoryId}
                    >
                        <Option value={undefined}>Tất cả</Option>
                        {categories.map((category) => (
                            <Option key={category.id} value={category.id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Select
                        placeholder="Lọc theo thương hiệu"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('brandId', value)}
                        allowClear
                        value={filters.brandId}
                    >
                        <Option value={undefined}>Tất cả</Option>
                        {brands.map((brand) => (
                            <Option key={brand.id} value={brand.id}>
                                {brand.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={3}>
                    <InputNumber
                        placeholder="Giá tối thiểu"
                        min={0}
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('minPrice', value)}
                        value={filters.minPrice}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={3}>
                    <InputNumber
                        placeholder="Giá tối đa"
                        min={0}
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('maxPrice', value)}
                        value={filters.maxPrice}
                    />
                </Col>
            </Row>

            {/* Bảng danh sách sản phẩm */}
            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} sản phẩm`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}

            />

            {/* Modal chỉnh sửa sản phẩm */}
            <ProductEditModal
                open={isEditModalOpen}
                productId={selectedProductId}
                onClose={() => setIsEditModalOpen(false)}
                onProductUpdated={() => fetchProducts(pagination.current, pagination.pageSize, filters)}
            />

            {/* Modal tạo mới sản phẩm */}
            <ProductCreateModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProductCreated={() => fetchProducts(pagination.current, pagination.pageSize, filters)}
            />

            {/* Modal xem chi tiết sản phẩm */}
            <ProductDetailModal
                open={isDetailModalOpen}
                productId={selectedProductId}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
};

export default ProductManagement;