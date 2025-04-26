import { Layout, Menu } from 'antd';
import { ShoppingCartOutlined, FileTextOutlined, UserOutlined, LockOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const { Sider } = Layout;

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

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const location = useLocation();

    const getSelectedKey = (path) => {
        if (path.startsWith('/cart')) return 'cart';
        if (path.startsWith('/orders')) return 'orders';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/change-password')) return 'change-password';
        return '';
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={200}
            collapsedWidth={80}
            style={{ backgroundColor: '#fff' }}
            theme="light"
            trigger={
                <div style={{ backgroundColor: '#fff', textAlign: 'center', padding: 4 }}>
                    {collapsed ? <RightOutlined /> : <LeftOutlined />}
                </div>
            }
        >
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