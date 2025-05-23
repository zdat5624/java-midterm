import { Typography, Table, message, Select, Modal, Descriptions, Tag, Button, Pagination } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = () => {
    const { token, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchOrders(pagination.currentPage);
    }, [isAuthenticated, token, pagination.currentPage, pagination.pageSize]);

    const fetchOrders = async (page) => {
        if (!isAuthenticated) {
            setOrders([]);
            setFilteredOrders([]);
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders?page=${page}&size=${pagination.pageSize}&sort=orderDate,desc`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            const ordersData = response.data.data.content || [];
            const formattedOrders = ordersData.map((order) => ({
                key: order.id,
                id: order.id,
                date: order.orderDate.split('T')[0],
                total: order.totalAmount,
                status: order.status,
                items: order.items,
            }));
            setOrders(formattedOrders);
            setFilteredOrders(formattedOrders);
            setPagination({
                currentPage: response.data.data.pageable?.pageNumber || 0,
                pageSize: response.data.data.pageable?.pageSize || 10,
                totalElements: response.data.data.totalElements || 0,
                totalPages: response.data.data.totalPages || 0,
            });
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy đơn hàng:', error);
            message.error('Lỗi khi lấy danh sách đơn hàng: ' + (error.response?.data?.message || 'Lỗi server'));
            setOrders([]);
            setFilteredOrders([]);
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        setDetailLoading(true);
        try {
            const orderResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            if (orderResponse.data.statusCode === 200) {
                const orderData = orderResponse.data.data;
                const formattedOrderData = {
                    ...orderData,
                    items: orderData.items.map((item) => ({
                        ...item,
                        key: item.id,
                    })),
                };
                setOrderDetails(formattedOrderData);

                const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${orderData.userId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                });
                if (userResponse.data.statusCode === 200) {
                    setUserDetails(userResponse.data.data);
                } else {
                    message.error('Lỗi khi tải thông tin người dùng.');
                }
            } else {
                message.error('Lỗi khi tải chi tiết đơn hàng.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setPagination((prev) => ({ ...prev, currentPage: 0 })); // Reset về trang đầu khi thay đổi bộ lọc
        if (value) {
            const filtered = orders.filter((order) => order.status === value);
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    };

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page - 1,
            pageSize: pageSize,
        }));
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        fetchOrderDetails(orderId);
        setModalVisible(true);
    };

    const formatVND = (price) => {
        if (typeof price !== 'number') return '0 đ';
        return price.toLocaleString('vi-VN') + ' đ';
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const statusDisplayMap = {
        PENDING: 'Đang chờ xử lý',
        CONFIRMED: 'Đã xác nhận',
        SHIPPED: 'Đã giao hàng',
        DELIVERED: 'Đã nhận hàng',
        CANCELLED: 'Đã hủy',
    };

    const statusColorMap = {
        PENDING: '#faad14', // Vàng
        CONFIRMED: '#1890ff', // Xanh dương
        SHIPPED: '#722ed1', // Tím
        DELIVERED: '#52c41a', // Xanh lá
        CANCELLED: '#ff4d4f', // Đỏ
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
            render: (id) => (
                <a onClick={() => handleViewDetails(id)} style={{ color: '#1890ff' }}>
                    {id}
                </a>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            sorter: (a, b) => a.total - b.total,
            render: (total) => formatVND(total),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => {
                const statusOrder = { PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: 4 };
                return statusOrder[a.status] - statusOrder[b.status];
            },
            render: (status) => (
                <Tag color={statusColorMap[status] || '#000'}>{statusDisplayMap[status] || status}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" onClick={() => handleViewDetails(record.id)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const detailColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatVND(price),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Tổng cộng',
            key: 'total',
            render: (_, item) => formatVND(item.price * item.quantity),
        },
    ];

    if (loading) return <div>Đang tải...</div>;

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Đơn hàng của bạn
            </Title>
            <div style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Lọc theo trạng thái"
                    value={statusFilter || undefined}
                    onChange={handleStatusFilterChange}
                    style={{ width: 200 }}
                    allowClear
                >
                    <Option value="PENDING">Đang chờ xử lý</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="SHIPPED">Đã giao hàng</Option>
                    <Option value="DELIVERED">Đã nhận hàng</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                </Select>
            </div>
            {filteredOrders.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Bạn chưa có đơn hàng nào.</p>
            ) : (
                <>
                    <Table columns={columns} dataSource={filteredOrders} pagination={false} />
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Pagination
                            current={pagination.currentPage + 1}
                            pageSize={pagination.pageSize}
                            total={pagination.totalElements}
                            onChange={handlePageChange}
                            showSizeChanger
                            pageSizeOptions={['10', '20', '50']}
                            disabled={loading}
                            style={{ fontSize: '16px' }}
                        />
                    </div>
                </>
            )}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrderId}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                centered
                width={800}
                footer={null}
            >
                {detailLoading ? (
                    <Text>Đang tải...</Text>
                ) : (
                    <>
                        <Descriptions title="Thông tin đơn hàng" bordered column={1}>
                            <Descriptions.Item label="Mã đơn hàng">{orderDetails?.id}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt hàng">{formatDate(orderDetails?.orderDate)}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={statusColorMap[orderDetails?.status]}>{statusDisplayMap[orderDetails?.status]}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">{formatVND(orderDetails?.totalAmount)}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions title="Thông tin người nhận" bordered column={1} style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Tên người nhận">{orderDetails?.receiverName}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{orderDetails?.receiverPhone}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">{orderDetails?.shippingAddress}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions title="Thông tin người đặt hàng" bordered column={1} style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Tên">{userDetails?.name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{userDetails?.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{userDetails?.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{userDetails?.address || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        <Typography.Title level={4} style={{ marginTop: 16 }}>
                            Danh sách sản phẩm
                        </Typography.Title>
                        <Table
                            columns={detailColumns}
                            dataSource={orderDetails?.items || []}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: true }}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Orders;