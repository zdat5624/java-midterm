import { Typography, Table, Button, message, Modal, Input } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const Cart = () => {
    const { user, token, isAuthenticated } = useAuth();
    const { updateCart } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [filteredCartItems, setFilteredCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [receiverName, setReceiverName] = useState('Le Van A');
    const [shippingAddress, setShippingAddress] = useState('Quận 7, TP Hồ Chí Minh');
    const [receiverPhone, setReceiverPhone] = useState('0987999999');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated, token]);

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setFilteredCartItems([]);
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            const items = response.data.data.items || [];
            const formattedItems = await Promise.all(
                items.map(async (item) => {
                    try {
                        const productResponse = await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/products/${item.productId}`,
                            {
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                withCredentials: true,
                            }
                        );
                        const productData = productResponse.data.data || {};
                        return {
                            ...item,
                            key: item.id,
                            images: productData.images || [],
                        };
                    } catch (error) {
                        console.error(`Lỗi khi lấy thông tin sản phẩm ${item.productId}:`, error);
                        return {
                            ...item,
                            key: item.id,
                            images: [],
                        };
                    }
                })
            );
            setCartItems(formattedItems);
            setFilteredCartItems(formattedItems);
            setLoading(false);
            updateCart();
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
            message.error('Lỗi khi lấy giỏ hàng: ' + (error.response?.data?.message || 'Lỗi server'));
            setCartItems([]);
            setFilteredCartItems([]);
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) {
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
            fetchCart();
        } catch (error) {
            message.error('Lỗi khi thêm vào giỏ hàng: ' + (error.response?.data?.message || 'Lỗi server'));
        }
    };

    const handleQuantityChange = async (itemId, quantity) => {
        try {
            const newQuantity = Math.max(1, parseInt(quantity) || 1);
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/cart/items/${itemId}`,
                { quantity: newQuantity },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            fetchCart();
        } catch (error) {
            message.error('Lỗi khi cập nhật số lượng: ' + (error.response?.data?.message || 'Lỗi server'));
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/cart/items/${itemId}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success('Đã xóa sản phẩm!');
            fetchCart();
        } catch (error) {
            message.error('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.message || 'Lỗi server'));
        }
    };

    const handleCreateOrder = async () => {
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để tạo đơn hàng!');
            return;
        }
        try {
            const orderData = {
                receiverName,
                shippingAddress,
                receiverPhone,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            };
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                orderData,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success('Đã tạo đơn hàng thành công!');
            setCartItems([]);
            setFilteredCartItems([]);
            setIsModalVisible(false);
            updateCart();
        } catch (error) {
            message.error('Lỗi khi tạo đơn hàng: ' + (error.response?.data?.message || 'Lỗi server'));
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value) {
            const filtered = cartItems.filter(item =>
                item.productName?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCartItems(filtered);
        } else {
            setFilteredCartItems(cartItems);
        }
    };

    const getImageUrl = (image) => (
        !image ? 'https://via.placeholder.com/150?text=No+Image' : `${import.meta.env.VITE_UPLOADS_URL}/${image}`
    );

    const calculateTotal = () => {
        return filteredCartItems.reduce((total, item) => 
            total + ((item.productPrice || 0) * (item.quantity || 0)), 0
        );
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images, record) => (
                <img
                    src={getImageUrl(images?.[0])}
                    alt={record.productName || 'Sản phẩm'}
                    style={{ width: 60, height: 60, objectFit: 'contain' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                />
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
            render: (text) => text || 'N/A',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
            render: (text, record) => (
                <input
                    type="number"
                    min="1"
                    value={text || 1}
                    onChange={(e) => handleQuantityChange(record.id, e.target.value)}
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'productPrice',
            key: 'productPrice',
            sorter: (a, b) => (a.productPrice || 0) - (b.productPrice || 0),
            render: (text) => `${(text || 0).toLocaleString()} VNĐ`,
        },
        {
            title: 'Tổng',
            key: 'total',
            render: (_, record) => `${((record.productPrice || 0) * (record.quantity || 0)).toLocaleString()} VNĐ`,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button danger onClick={() => handleRemove(record.id)}>Xóa</Button>
            ),
        },
    ];

    if (loading) return <div>Đang tải...</div>;

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Giỏ hàng của bạn</Title>
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm sản phẩm trong giỏ hàng"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </div>
            {filteredCartItems.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Giỏ hàng của bạn trống hoặc không tìm thấy sản phẩm.</p>
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={filteredCartItems}
                        pagination={false}
                        style={{ marginBottom: 24 }}
                    />
                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Paragraph strong style={{ fontSize: 16 }}>
                            Tổng tiền giỏ hàng: {calculateTotal().toLocaleString()} VNĐ
                        </Paragraph>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => setIsModalVisible(true)}
                        >
                            Tiến hành đặt hàng
                        </Button>
                    </div>
                </>
            )}
            <Modal
                title="Thông tin giao hàng"
                visible={isModalVisible}
                onOk={handleCreateOrder}
                onCancel={() => setIsModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Paragraph>Tên người nhận:</Paragraph>
                <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    style={{ width: '100%', marginBottom: 16, padding: 8 }}
                />
                <Paragraph>Địa chỉ giao hàng:</Paragraph>
                <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    style={{ width: '100%', marginBottom: 16, padding: 8 }}
                />
                <Paragraph>Số điện thoại:</Paragraph>
                <input
                    type="text"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    style={{ width: '100%', marginBottom: 16, padding: 8 }}
                />
            </Modal>
        </div>
    );
};

export default Cart;