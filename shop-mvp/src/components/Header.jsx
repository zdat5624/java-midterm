import { Layout, Menu, Dropdown, Avatar, Button, Drawer } from 'antd';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';


const { Header } = Layout;

const userMenuItems = [
    {
        key: '1',
        label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
        key: '2',
        label: <Link to="/admin">Quản trị</Link>,
    },
    {
        key: '3',
        label: <Link to="/logout">Đăng xuất</Link>,
    },

];

const navItems = [
    { key: 'home', label: <Link to="/">Home</Link> },
    { key: 'products', label: <Link to="/products">Products</Link> },
];

const HeaderComponent = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    const location = useLocation();

    const getSelectedKey = (path) => {
        if (path === '/') return 'home';
        if (path.startsWith('/products')) return 'products';
        return '';
    };


    return (
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
                            style={{ marginLeft: 16, borderBottom: 'none' }}
                        />
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isMobile ? (
                        <>
                            <Button
                                type="link"
                                icon={<MenuOutlined />}
                                onClick={showDrawer}
                                style={{ marginRight: 8 }}
                            />
                            <Drawer
                                title="Menu"
                                placement="right"
                                onClose={onClose}
                                open={drawerVisible}
                            >
                                <Menu selectedKeys={[getSelectedKey(location.pathname)]}
                                    mode="inline"
                                    theme="light" items={navItems} />
                                <Menu

                                    mode="inline"
                                    theme="light"
                                    items={[

                                        ...userMenuItems,
                                        {
                                            key: 'login',
                                            label: <Link to="/login">Đăng nhập</Link>,
                                        },
                                    ]}
                                />
                            </Drawer>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ marginRight: 16 }}>
                                <Button type="primary">Login</Button>
                            </Link>
                            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                                <Avatar icon={<UserOutlined />} className="cursor-pointer" />
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>
        </Header>
    );
};

export default HeaderComponent;