import { Typography, Table, Button, message, Modal, Input, Tooltip, Card } from 'antd';
import { ShoppingCartOutlined, FileTextOutlined, UserOutlined, LockOutlined, LeftOutlined, RightOutlined, DeleteOutlined, DeleteFilled, CreditCardOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const Cart = () => {
    const { user, token, isAuthenticated } = useAuth();
    const { updateCart } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [filteredCartItems, setFilteredCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [receiverName, setReceiverName] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');
    const [errors, setErrors] = useState({
        receiverName: '',
        shippingAddress: '',
        receiverPhone: '',
    });
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
        if (!isAuthenticated || !token) {
            message.error('Vui lòng đăng nhập để xóa sản phẩm!');
            return;
        }
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axios.delete(
                        `${import.meta.env.VITE_API_URL}/api/cart/items/${itemId}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                            withCredentials: true,
                        }
                    );
                    message.success('Đã xóa sản phẩm!');
                    fetchCart();
                } catch (error) {
                    console.error('Lỗi khi xóa sản phẩm:', error);
                    message.error('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.message || 'Lỗi server'));
                    fetchCart();
                }
            },
        });
    };

    const validateForm = () => {
        const newErrors = {
            receiverName: '',
            shippingAddress: '',
            receiverPhone: '',
        };
        let isValid = true;

        if (!receiverName.trim()) {
            newErrors.receiverName = 'Tên người nhận không được để trống';
            isValid = false;
        }

        if (!shippingAddress.trim()) {
            newErrors.shippingAddress = 'Địa chỉ giao hàng không được để trống';
            isValid = false;
        }

        if (!receiverPhone.trim()) {
            newErrors.receiverPhone = 'Số điện thoại không được để trống';
            isValid = false;
        } else {
            const phoneRegex = /^0\d{9}$/;
            if (!phoneRegex.test(receiverPhone)) {
                newErrors.receiverPhone = 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 0';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCreateOrder = async () => {
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để tạo đơn hàng!');
            return;
        }
        if (!validateForm()) {
            message.error('Vui lòng kiểm tra lại thông tin giao hàng');
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
            await axios.post(
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
            setReceiverName('');
            setShippingAddress('');
            setReceiverPhone('');
            setErrors({ receiverName: '', shippingAddress: '', receiverPhone: '' });
            updateCart();
        } catch (error) {
            message.error('Lỗi khi tạo đơn hàng: ' + (error.response?.data?.message || 'Lỗi server'));
        }
    };

    const handleInputChange = (setter, field) => (e) => {
        setter(e.target.value);
        setErrors((prev) => ({ ...prev, [field]: '' }));
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
        !image ? 'https://via.placeholder.com/150?text=No+Image' : `${import.meta.env.VITE_API_URL}/uploads/${image}`
    );

    const calculateTotal = () => {
        return filteredCartItems.reduce((total, item) =>
            total + ((item.productPrice || 0) * (item.quantity || 0)), 0
        );
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
            render: (text) => text || 'N/A',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images, record) => (
                <img
                    src={getImageUrl(images?.[0])}
                    alt={record.productName || 'Sản phẩm'}
                    className="w-[60px] h-[60px] object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                />
            ),
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
                    className="w-[60px] p-1 border rounded"
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
            sorter: (a, b) => (a.productPrice || 0) * (a.quantity || 0) - (b.productPrice || 0) * (b.quantity || 0),
            render: (_, record) => `${((record.productPrice || 0) * (record.quantity || 0)).toLocaleString()} VNĐ`,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Xóa sản phẩm khỏi giỏ hàng">
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(record.id)}
                        danger
                    />
                </Tooltip>
            ),
        },
    ];

    // Tự động điền thông tin người dùng khi mở modal
    const handleOpenModal = () => {
        if (filteredCartItems.length === 0) {
            message.error('Giỏ hàng trống, vui lòng thêm sản phẩm!');
            return;
        }
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để đặt hàng!');
            return;
        }
        setReceiverName(user?.name || '');
        setShippingAddress(user?.address || '');
        setReceiverPhone(user?.phone || '');
        setErrors({ receiverName: '', shippingAddress: '', receiverPhone: '' });
        setIsModalVisible(true);
    };

    if (loading) return <div className="text-center py-6">Đang tải...</div>;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Title level={2} className="text-center mb-6 text-2xl sm:text-3xl">
                <ShoppingCartOutlined className="mr-2" /> Giỏ hàng của bạn
            </Title>
            {filteredCartItems.length === 0 ? (
                <p className="text-center text-gray-600 py-6">Giỏ hàng của bạn đang trống!</p>
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={filteredCartItems}
                        pagination={false}
                        className="mb-6 mt-2 overflow-x-auto"
                        scroll={{ x: true }}
                    />
                    <Card
                        className="w-full sm:max-w-sm ml-auto p-1 mb-1 rounded-lg shadow-sm bg-white flex flex-col items-center gap-3"
                    >
                        <Paragraph strong className="text-lg font-semibold text-gray-800 text-center">
                            Tổng tiền đơn hàng:
                        </Paragraph>
                        <Paragraph strong className="text-lg font-semibold text-gray-800 text-center">
                            {calculateTotal().toLocaleString()} VNĐ
                        </Paragraph>
                        <Button
                            type="primary"
                            size="large"
                            icon={<CreditCardOutlined />}
                            onClick={handleOpenModal}
                            className="flex items-center px-4"
                        >
                            Tiến hành đặt hàng
                        </Button>
                    </Card>
                </>
            )}
            <Modal
                title="Thông tin giao hàng"
                open={isModalVisible}
                onOk={handleCreateOrder}
                onCancel={() => {
                    setIsModalVisible(false);
                    setReceiverName('');
                    setShippingAddress('');
                    setReceiverPhone('');
                    setErrors({ receiverName: '', shippingAddress: '', receiverPhone: '' });
                }}
                width={600}
                okText="Xác nhận"
                cancelText="Hủy"
                className=" mx-auto"
                okButtonProps={{
                    disabled: !receiverName.trim() || !shippingAddress.trim() || !receiverPhone.trim() || !!errors.receiverName || !!errors.shippingAddress || !!errors.receiverPhone,
                }}
            >
                <Paragraph className="mb-2">Tên người nhận:</Paragraph>
                <Input
                    value={receiverName}
                    onChange={handleInputChange(setReceiverName, 'receiverName')}
                    className="w-full mb-2"
                    status={errors.receiverName ? 'error' : ''}
                />
                {errors.receiverName && (
                    <Paragraph className="text-red-500 text-sm mb-2">{errors.receiverName}</Paragraph>
                )}

                <Paragraph className="mb-2">Địa chỉ giao hàng:</Paragraph>
                <Input
                    value={shippingAddress}
                    onChange={handleInputChange(setShippingAddress, 'shippingAddress')}
                    className="w-full mb-2"
                    status={errors.shippingAddress ? 'error' : ''}
                />
                {errors.shippingAddress && (
                    <Paragraph className="text-red-500 text-sm mb-2">{errors.shippingAddress}</Paragraph>
                )}

                <Paragraph className="mb-2">Số điện thoại:</Paragraph>
                <Input
                    value={receiverPhone}
                    onChange={handleInputChange(setReceiverPhone, 'receiverPhone')}
                    className="w-full mb-2"
                    status={errors.receiverPhone ? 'error' : ''}
                    maxLength={10}
                    onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                />
                {errors.receiverPhone && (
                    <Paragraph className="text-red-500 text-sm mb-2">{errors.receiverPhone}</Paragraph>
                )}
            </Modal>
        </div >
    );
};

export default Cart;