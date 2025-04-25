import { Layout, Dropdown, Avatar, Drawer, Button, Menu } from 'antd';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const { Header } = Layout;

const adminMenuItems = [
    {
        key: '1',
        label: <Link to="/">Go to Home</Link>,
    },
    {
        key: '2',
        label: <Link to="/logout">Logout</Link>,
    },
];

const AdminHeader = () => {
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

    return (
        <Header style={{ backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/admin" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    Admin
                </Link>

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
                                bodyStyle={{ padding: 0 }}
                            >
                                <Menu mode="inline" theme="light" items={adminMenuItems} />
                            </Drawer>
                        </>
                    ) : (
                        <Dropdown menu={{ items: adminMenuItems }} trigger={['click']}>
                            <Avatar icon={<UserOutlined />} className="cursor-pointer" />
                        </Dropdown>
                    )}
                </div>
            </div>
        </Header>
    );
};

export default AdminHeader;