import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, ShoppingOutlined, FileTextOutlined, AppstoreOutlined, LeftOutlined, RightOutlined, ShopOutlined, TrademarkOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
    {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/admin">Dashboard</Link>,
    },
    {
        key: 'users',
        icon: <UserOutlined />,
        label: <Link to="/admin/users">Người dùng</Link>,
    },
    {
        key: 'products',
        icon: <ShoppingOutlined />,
        label: <Link to="/admin/products">Sản phẩm</Link>,
    },
    {
        key: 'categories',
        icon: <AppstoreOutlined />,
        label: <Link to="/admin/categories">Danh mục</Link>,
    },
    {
        key: 'brands',
        icon: <TrademarkOutlined />,
        label: <Link to="/admin/brands">Thương hiệu</Link>,
    },
    {
        key: 'orders',
        icon: <FileTextOutlined />,
        label: <Link to="/admin/orders">Đơn hàng</Link>,
    },
];

const AdminSidebar = () => {
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
        if (path.startsWith('/admin/users')) return 'users';
        if (path.startsWith('/admin/products')) return 'products';
        if (path.startsWith('/admin/categories')) return 'categories';
        if (path.startsWith('/admin/brands')) return 'brands';
        if (path.startsWith('/admin/orders')) return 'orders';
        return 'dashboard'; // Mặc định
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
                <div style={{ backgroundColor: '#fff', textAlign: 'center' }}>
                    {collapsed ? (
                        <RightOutlined />
                    ) : (
                        <LeftOutlined />
                    )}
                </div>
            }
        >
            <Menu
                mode="inline"
                theme="light"
                items={menuItems}
                defaultSelectedKeys={['dashboard']}
                selectedKeys={[getSelectedKey(location.pathname)]}
            />
        </Sider>
    );
};

export default AdminSidebar;