import { useState, useEffect } from 'react';
import { Typography, Table, Input, Row, Col, Space, DatePicker, Tooltip, Tabs, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import UpdateOrderStatus from '../../components/order/UpdateOrderStatus';
import OrderDetailModal from '../../components/order/OrderDetailModal';
import axiosInstance from '../../api/axiosConfig';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Danh sách trạng thái đơn hàng, bao gồm "ALL"
const orderStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Ánh xạ trạng thái từ tiếng Anh sang tiếng Việt
const statusDisplayMap = {
    ALL: 'Tất cả',
    PENDING: 'Đang chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPED: 'Đã giao hàng',
    DELIVERED: 'Đã nhận hàng',
    CANCELLED: 'Đã hủy',
};

// Ánh xạ màu sắc cho từng trạng thái (dùng trong bảng)
const statusColorMap = {
    PENDING: '#faad14', // Vàng
    CONFIRMED: '#1890ff', // Xanh dương
    SHIPPED: '#722ed1', // Tím
    DELIVERED: '#52c41a', // Xanh lá
    CANCELLED: '#ff4d4f', // Đỏ
};

// Hàm format tiền Việt Nam
const formatVND = (price) => {
    if (typeof price !== 'number') return '0 đ';
    return price.toLocaleString('vi-VN') + ' đ';
};

// Hàm format ngày giờ sử dụng dayjs
const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

// Hàm chuyển đổi ngày sang định dạng ISO
const toISOString = (date) => {
    if (!date) return undefined;
    return date.toISOString();
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
    });
    const [filters, setFilters] = useState({
        status: 'ALL', // Trạng thái mặc định là "Tất cả"
        search: '',
        startDate: null,
        endDate: null,
        sort: 'orderDate,desc',
    });
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Gọi API để lấy danh sách đơn hàng
    const fetchOrders = async (page = 1, pageSize = 10, filters = {}) => {
        setLoading(true);
        try {
            const params = {
                status: filters.status !== 'ALL' ? filters.status : undefined, // Không gửi status nếu tab là "Tất cả"
                search: filters.search || undefined,
                startDate: filters.startDate ? toISOString(filters.startDate) : undefined,
                endDate: filters.endDate ? toISOString(dayjs(filters.endDate).hour(23).minute(59).second(59).millisecond(999)) : undefined,
                sort: filters.sort || undefined,
                page: page - 1,
                size: pageSize,
            };

            const response = await axiosInstance.get('/api/orders/all', { params });
            if (response.data.statusCode === 200) {
                setOrders(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                });
            } else {
                throw new Error('Lỗi khi tải danh sách đơn hàng.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy đơn hàng:', error);
            setOrders([]); // Đặt orders về rỗng để tránh lỗi giao diện
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi component được render
    useEffect(() => {
        fetchOrders(pagination.current, pagination.pageSize, filters);
    }, []);

    // Xử lý thay đổi tab
    const handleTabChange = (status) => {
        const newFilters = { ...filters, status, search: '' }; // Reset search khi đổi tab
        setFilters(newFilters);
        fetchOrders(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi phân trang và sắp xếp
    const handleTableChange = (newPagination, _, sorter) => {
        const newSort = sorter.order
            ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
            : filters.sort;
        const updatedFilters = { ...filters, sort: newSort };
        setFilters(updatedFilters);
        fetchOrders(newPagination.current, newPagination.pageSize, updatedFilters);
        setPagination(newPagination);
    };

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        fetchOrders(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi khoảng ngày
    const handleDateRangeChange = (dates) => {
        const newFilters = {
            ...filters,
            startDate: dates ? dates[0] : null,
            endDate: dates ? dates[1] : null,
        };
        setFilters(newFilters);
        fetchOrders(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý mở modal chi tiết đơn hàng
    const showDetailModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalVisible(true);
    };

    // Xử lý đóng modal chi tiết đơn hàng
    const closeDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedOrderId(null);
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'Mã đơn hàng', dataIndex: 'id', key: 'id', sorter: true },
        {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            sorter: true,
            render: (date) => formatDate(date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: true,
            render: (amount) => formatVND(amount),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status) => (
                <Tag color={statusColorMap[status]}>{statusDisplayMap[status] || status}</Tag>
            ),
        },
        { title: 'Địa chỉ giao hàng', dataIndex: 'shippingAddress', key: 'shippingAddress' },
        { title: 'Người nhận', dataIndex: 'receiverName', key: 'receiverName' },
        { title: 'Số điện thoại', dataIndex: 'receiverPhone', key: 'receiverPhone' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => showDetailModal(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật trạng thái">
                        <UpdateOrderStatus
                            orderId={record.id}
                            currentStatus={record.status}
                            onSuccess={() => fetchOrders(pagination.current, pagination.pageSize, filters)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Hiển thị chi tiết các mặt hàng trong đơn hàng khi mở rộng hàng
    const expandedRowRender = (record) => {
        const itemColumns = [
            { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
            {
                title: 'Hình ảnh',
                dataIndex: 'productImage',
                key: 'productImage',
                render: (image) => (
                    <img
                        src={`${import.meta.env.VITE_UPLOADS_URL}/${image}`}
                        alt="product"
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                ),
            },
            {
                title: 'Giá',
                dataIndex: 'price',
                key: 'price',
                render: (price) => formatVND(price),
            },
            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
            {
                title: 'Tổng',
                key: 'total',
                render: (_, item) => formatVND(item.price * item.quantity),
            },
        ];

        return (
            <Table
                columns={itemColumns}
                dataSource={record.items}
                pagination={false}
                rowKey="id"
            />
        );
    };

    // Định nghĩa các tab bằng prop items
    const tabItems = orderStatuses.map((status) => ({
        key: status,
        label: statusDisplayMap[status],
        children: (
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                expandable={{ expandedRowRender }}
                scroll={{ x: true }}
            />
        ),
    }));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Quản lý đơn hàng
                </Title>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Tìm theo mã đơn hàng hoặc số điện thoại"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>

            {/* Tabs cho các trạng thái */}
            <Tabs
                activeKey={filters.status}
                onChange={handleTabChange}
                items={tabItems}
            />

            {/* Modal chi tiết đơn hàng */}
            <OrderDetailModal
                orderId={selectedOrderId}
                open={isDetailModalVisible}
                onClose={closeDetailModal}
            />
        </div>
    );
};

export default OrderManagement;