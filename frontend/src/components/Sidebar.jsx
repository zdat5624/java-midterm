import { Layout, Menu, Avatar, Typography, Space } from 'antd';
import { ShoppingCartOutlined, FileTextOutlined, UserOutlined, LockOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../pages/contexts/AuthContext'

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: 'cart',
        icon: <ShoppingCartOutlined />,
        label: <Link to="/cart">Giỏ hàng</Link>,
    },
    {
        key: 'orders',
        icon: <FileTextOutlined />,
        label: <Link to="/orders">Đơn hàng</Link>,
    },
    {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
        key: 'change-password',
        icon: <LockOutlined />,
        label: <Link to="/change-password">Đổi mật khẩu</Link>,
    },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
    const location = useLocation();
    const { user } = useAuth(); // Lấy thông tin user từ AuthContext

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getSelectedKey = (path) => {
        if (path.startsWith('/cart')) return 'cart';
        if (path.startsWith('/orders')) return 'orders';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/change-password')) return 'change-password';
        return '';
    };

    const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;
    const avatarUrl = user?.avatar ? `${UPLOADS_URL}/${user.avatar}` : null;

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={200}
            collapsedWidth={80}
            theme="light"
            trigger={
                <div style={{ textAlign: 'center', padding: 4 }}>
                    {collapsed ? <RightOutlined /> : <LeftOutlined />}
                </div>
            }
        >
            {/* Phần hiển thị tên và avatar của user */}
            <div style={{ padding: collapsed ? '16px 8px' : '16px', textAlign: 'center' }}>
                <Space direction="vertical" align="center">
                    <Avatar
                        size={collapsed ? 40 : 64}
                        src={avatarUrl}
                        icon={<UserOutlined />}
                        style={{ marginBottom: 8 }}
                    />
                    {!collapsed && (
                        <Text strong style={{ fontSize: 16 }}>
                            {user?.name || 'User'}
                        </Text>
                    )}
                </Space>
            </div>

            <Menu
                mode="inline"
                theme="light"
                items={menuItems}
                defaultSelectedKeys={['cart']}
                selectedKeys={[getSelectedKey(location.pathname)]}
            />
        </Sider>
    );
};

export default Sidebar;