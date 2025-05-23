import { Layout, Menu, Dropdown, Avatar, Button, Drawer, Modal } from 'antd';
import {
    UserOutlined,
    MenuOutlined,
    ExclamationCircleOutlined,
    HomeOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    LockOutlined,
    LogoutOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CartIcon from './CartIcon';
import { useAuth } from '../pages/contexts/AuthContext';
import { useCart } from '../pages/contexts/CartContext';
import LoginModal from './LoginModal';

const { Header } = Layout;

const HeaderComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { cartItemCount } = useCart();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [modalVisible, setModalVisible] = useState(false);
    const [loginModalVisible, setLoginModalVisible] = useState(false);

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
        logout();
        setModalVisible(false);
        navigate('/');
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const showLoginModal = () => {
        setLoginModalVisible(true);
    };

    const handleLoginCancel = () => {
        setLoginModalVisible(false);
    };

    const handleLoginSuccess = () => {
        setLoginModalVisible(false);
    };

    const getSelectedKey = (path) => {
        if (path === '/') return 'home';
        if (path.startsWith('/products/')) return 'productdetail';
        if (path.startsWith('/products')) return 'products';
        if (path.startsWith('/cart')) return 'cart';
        if (path.startsWith('/orders')) return 'orders';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/change-password')) return 'change-password';
        if (path.startsWith('/admin')) return 'admin';
        return '';
    };

    const navItems = [
        { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link>, style: { minWidth: '120px', textAlign: 'center' } },
        { key: 'products', icon: <ShopOutlined />, label: <Link to="/products">Sản phẩm</Link>, style: { minWidth: '120px', textAlign: 'center' } },
    ];

    const baseUserMenuItems = [
        { key: 'cart', icon: <ShoppingCartOutlined />, label: <Link to="/cart">Giỏ hàng</Link> },
        { key: 'orders', icon: <FileTextOutlined />, label: <Link to="/orders">Đơn hàng</Link> },
        { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Hồ sơ</Link> },
        { key: 'change-password', icon: <LockOutlined />, label: <Link to="/change-password">Đổi mật khẩu</Link> },
        { key: 'logout', icon: <LogoutOutlined />, label: <span onClick={showLogoutModal}>Đăng xuất</span> },
    ];

    const userMenuItems = user?.role === 'ADMIN'
        ? [
            ...baseUserMenuItems.slice(0, 4),
            { key: 'admin', icon: <SettingOutlined />, label: <Link to="/admin">Quản trị</Link> },
            ...baseUserMenuItems.slice(4),
        ]
        : baseUserMenuItems;

    const handleMenuClick = () => {
        onClose();
    };

    const avatarUrl = user?.avatar ? `${import.meta.env.VITE_UPLOADS_URL}/${user.avatar}` : null;

    return (
        <>
            <Header style={{ backgroundColor: '#001529', padding: '0 24px', height: 64, position: 'sticky', top: 0, zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                            XShop
                        </Link>
                        {!isMobile && (
                            <Menu
                                selectedKeys={[getSelectedKey(location.pathname)]}
                                mode="horizontal"
                                theme="dark"
                                items={navItems}
                                style={{ marginLeft: 24, borderBottom: 'none', background: 'transparent', color: '#fff' }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginRight: 24 }}>
                            <CartIcon />
                        </div>
                        {isMobile ? (
                            <>
                                <Button
                                    type="link"
                                    icon={<MenuOutlined />}
                                    onClick={showDrawer}
                                    style={{ color: '#fff', marginRight: 0 }}
                                />
                                <Drawer
                                    title="Menu"
                                    placement="right"
                                    onClose={onClose}
                                    open={drawerVisible}
                                    bodyStyle={{ padding: 0 }}
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
                                                        icon: <UserOutlined />,
                                                        label: <span onClick={showLoginModal}>Đăng nhập</span>,
                                                    },
                                                    {
                                                        key: 'register',
                                                        icon: <UserOutlined />,
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
                                <span style={{ color: '#fff' }}>{user?.name || 'User'}</span>
                                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                                    <Avatar
                                        src={avatarUrl}
                                        icon={!avatarUrl && <UserOutlined />}
                                        style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                                    />
                                </Dropdown>
                            </div>
                        ) : (
                            <>
                                <Button type="primary" onClick={showLoginModal} style={{ marginRight: 16 }}>
                                    Đăng nhập
                                </Button>
                                <Link to="/register">
                                    <Button style={{ background: '#fff', color: '#001529' }}>Đăng ký</Button>
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

            <LoginModal
                visible={loginModalVisible}
                onCancel={handleLoginCancel}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
};

export default HeaderComponent;