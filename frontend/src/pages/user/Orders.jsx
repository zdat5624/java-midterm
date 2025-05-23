import { Typography, Table, message, Tabs, Button, Tag, Tooltip, Modal } from 'antd';
import { EyeOutlined, FileTextOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import OrderDetailModal from '../../components/order/OrderDetaiForUserlModal';

const { Title } = Typography;
const { TabPane } = Tabs;

// Danh sách trạng thái đơn hàng, bao gồm "ALL"
const orderStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Ánh xạ trạng thái sang tiếng Việt
const statusDisplayMap = {
    ALL: 'Tất cả',
    PENDING: 'Đang chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPED: 'Đã giao hàng',
    DELIVERED: 'Đã nhận hàng',
    CANCELLED: 'Đã hủy',
};

// Ánh xạ màu sắc cho trạng thái
const statusColorMap = {
    PENDING: '#faad14', // Vàng
    CONFIRMED: '#1890ff', // Xanh dương
    SHIPPED: '#722ed1', // Tím
    DELIVERED: '#52c41a', // Xanh lá
    CANCELLED: '#ff4d4f', // Đỏ
};

const Orders = () => {
    const { token, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: ['6', '12', '24'],
    });
    const [filters, setFilters] = useState({
        status: 'ALL',
        sort: 'orderDate,desc',
    });

    useEffect(() => {
        fetchOrders(pagination.current, pagination.pageSize, filters.status, filters.sort);
    }, [isAuthenticated, token, pagination.current, pagination.pageSize, filters.status, filters.sort]);

    const fetchOrders = async (page, pageSize, status, sort = 'orderDate,desc') => {
        if (!isAuthenticated) {
            setOrders([]);
            setFilteredOrders([]);
            setLoading(false);
            return;
        }
        try {
            const url = `${import.meta.env.VITE_API_URL}/api/orders?page=${page - 1}&size=${pageSize}&sort=${sort}${status && status !== 'ALL' ? `&status=${status}` : ''}`;
            const response = await axios.get(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            const ordersData = response.data.data.content || [];
            const formattedOrders = ordersData.map((order) => ({
                key: order.id,
                id: order.id,
                orderDate: order.orderDate,
                totalAmount: order.totalAmount,
                status: order.status,
                items: order.items,
            }));
            setOrders(formattedOrders);
            setFilteredOrders(formattedOrders);
            setPagination({
                ...pagination,
                current: page,
                pageSize: response.data.data.pageable?.pageSize || pageSize,
                total: response.data.data.totalElements || 0,
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

    const handleTabChange = (status) => {
        const newFilters = { ...filters, status };
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchOrders(1, pagination.pageSize, status, filters.sort);
    };

    const handleTableChange = (newPagination, _, sorter) => {
        const fieldMap = {
            id: 'id',
            orderDate: 'orderDate',
            totalAmount: 'totalAmount',
            status: 'status',
        };
        const newSort = sorter.order
            ? `${fieldMap[sorter.field] || sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
            : filters.sort;
        const updatedFilters = { ...filters, sort: newSort };
        setFilters(updatedFilters);
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
        fetchOrders(newPagination.current, newPagination.pageSize, filters.status, newSort);
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedOrderId(null);
    };

    const handleCancelOrder = (orderId) => {
        setOrderToCancel(orderId);
        setCancelModalVisible(true);
    };

    const confirmCancelOrder = async () => {
        if (!orderToCancel) return;
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderToCancel}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );
            message.success('Hủy đơn hàng thành công!');
            setCancelModalVisible(false);
            setOrderToCancel(null);
            // Làm mới danh sách đơn hàng
            fetchOrders(pagination.current, pagination.pageSize, filters.status, filters.sort);
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            message.error('Lỗi khi hủy đơn hàng: ' + (error.response?.data?.message || 'Lỗi server'));
            setCancelModalVisible(false);
            setOrderToCancel(null);
        }
    };

    const formatVND = (price) => {
        if (typeof price !== 'number') return '0 đ';
        return price.toLocaleString('vi-VN') + ' đ';
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            sorter: true,
            render: (id) => (
                <a onClick={() => handleViewDetails(id)}>
                    {id}
                </a>
            ),
        },
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
            render: (total) => formatVND(total),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status) => (
                <Tag color={statusColorMap[status] || '#000'}>{statusDisplayMap[status] || status}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record.id)}
                        />
                    </Tooltip>
                    {record.status === 'PENDING' && (
                        <Tooltip title="Hủy đơn hàng">
                            <Button
                                type="link"
                                icon={<StopOutlined />}
                                onClick={() => handleCancelOrder(record.id)}
                                danger
                            />
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    if (loading) return <div>Đang tải...</div>;

    return (
        <div>
            <Title level={2}>
                <FileTextOutlined /> Đơn hàng của bạn
            </Title>
            <Tabs
                activeKey={filters.status}
                onChange={handleTabChange}
            >
                {orderStatuses.map((status) => (
                    <TabPane tab={statusDisplayMap[status]} key={status} />
                ))}
            </Tabs>
            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="key"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} đơn hàng`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />
            <OrderDetailModal
                orderId={selectedOrderId}
                open={modalVisible}
                onClose={handleCloseModal}
            />
            <Modal
                title="Xác nhận hủy đơn hàng"
                open={cancelModalVisible}
                onOk={confirmCancelOrder}
                onCancel={() => {
                    setCancelModalVisible(false);
                    setOrderToCancel(null);
                }}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
                okButtonProps={{ danger: true }}
                className="max-w-md mx-auto"
            >
                <p>Bạn có chắc chắn muốn hủy đơn hàng #{orderToCancel} không? Hành động này không thể hoàn tác.</p>
            </Modal>
        </div>
    );
};

export default Orders;