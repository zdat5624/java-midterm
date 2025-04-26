import { Layout, Menu, Dropdown, Avatar, Button, Drawer, Modal } from 'antd';
import { UserOutlined, MenuOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CartIcon from './CartIcon';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

const { Header } = Layout;

const HeaderComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth(); // Sử dụng useAuth
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onClose = () => {
        setDrawerVisible(false);
    };

    const showLogoutModal = () => {
        setModalVisible(true);
    };

    const handleLogout = () => {
        logout(); // Gọi logout từ AuthContext
        setModalVisible(false);
        navigate('/');
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const getSelectedKey = (path) => {
        if (path === '/') return 'home';
        if (path.startsWith('/products')) return 'products';
        if (path.startsWith('/cart')) return 'cart';
        if (path.startsWith('/orders')) return 'orders';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/change-password')) return 'change-password';
        if (path.startsWith('/admin')) return 'admin';
        return '';
    };

    const navItems = [
        {
            key: 'home',
            label: <Link to="/">Trang chủ</Link>,
            style: { minWidth: '95px' },
        },
        {
            key: 'products',
            label: <Link to="/products">Sản phẩm</Link>,
            style: { minWidth: '95px' },
        },
    ];

    const baseUserMenuItems = [
        {
            key: 'cart',
            label: <Link to="/cart">Giỏ hàng</Link>,
        },
        {
            key: 'orders',
            label: <Link to="/orders">Đơn hàng</Link>,
        },
        {
            key: 'profile',
            label: <Link to="/profile">Hồ sơ</Link>,
        },
        {
            key: 'change-password',
            label: <Link to="/change-password">Đổi mật khẩu</Link>,
        },
        {
            key: 'logout',
            label: <span onClick={showLogoutModal}>Đăng xuất</span>,
        },
    ];

    const userMenuItems = user?.role === 'ADMIN'
        ? [
            ...baseUserMenuItems.slice(0, 4),
            {
                key: 'admin',
                label: <Link to="/admin">Quản trị</Link>,
            },
            ...baseUserMenuItems.slice(4),
        ]
        : baseUserMenuItems;

    const handleMenuClick = () => {
        onClose();
    };

    const avatarUrl = user?.avatar ? `${UPLOADS_URL}/${user.avatar}` : null;

    return (
        <>
            <Header style={{ backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            XShop
                        </Link>
                        {!isMobile && (
                            <Menu
                                selectedKeys={[getSelectedKey(location.pathname)]}
                                mode="horizontal"
                                theme="light"
                                items={navItems}
                                style={{ marginLeft: 0, borderBottom: 'none' }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginRight: 32 }}>
                            <CartIcon />
                        </div>
                        {isMobile ? (
                            <>
                                <Button
                                    type="link"
                                    icon={<MenuOutlined />}
                                    onClick={showDrawer}
                                    style={{ marginRight: 0 }}
                                />
                                <Drawer
                                    title="Menu"
                                    placement="right"
                                    onClose={onClose}
                                    open={drawerVisible}
                                >
                                    <Menu
                                        selectedKeys={[getSelectedKey(location.pathname)]}
                                        mode="inline"
                                        theme="light"
                                        items={navItems}
                                        onClick={handleMenuClick}
                                    />
                                    <Menu
                                        selectedKeys={[getSelectedKey(location.pathname)]}
                                        mode="inline"
                                        theme="light"
                                        items={
                                            isAuthenticated
                                                ? userMenuItems
                                                : [
                                                    {
                                                        key: 'login',
                                                        label: <Link to="/login">Đăng nhập</Link>,
                                                    },
                                                    {
                                                        key: 'register',
                                                        label: <Link to="/register">Đăng ký</Link>,
                                                    },
                                                ]
                                        }
                                        onClick={handleMenuClick}
                                    />
                                </Drawer>
                            </>
                        ) : isAuthenticated ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{user?.name || 'User'}</span>
                                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                                    <Avatar
                                        src={avatarUrl}
                                        icon={!avatarUrl && <UserOutlined />}
                                        className="cursor-pointer"
                                    />
                                </Dropdown>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" style={{ marginRight: 16 }}>
                                    <Button type="primary">Đăng nhập</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Đăng ký</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </Header>

            <Modal
                title={
                    <div>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        Xác nhận đăng xuất
                    </div>
                }
                open={modalVisible}
                onOk={handleLogout}
                onCancel={handleCancel}
                okText="Đăng xuất"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn đăng xuất không?</p>
            </Modal>
        </>
    );
};

export default HeaderComponent;