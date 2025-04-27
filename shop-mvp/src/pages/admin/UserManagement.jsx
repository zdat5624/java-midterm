import { useState, useEffect } from 'react';
import { Typography, Table, Button, Input, Select, Row, Col, Space, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import UserDetailModal from '../../components/user/UserDetailModal';
import UserEditModal from '../../components/user/UserEditModal';
import UserCreateModal from '../../components/user/UserCreateModal';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        email: '',
        phone: '',
        role: '',
        gender: '',
    });
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    // Gọi API để lấy danh sách người dùng
    const fetchUsers = async (page = 1, pageSize = 10, filters = {}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/users', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    email: filters.email || undefined,
                    phone: filters.phone || undefined,
                    role: filters.role || undefined,
                    gender: filters.gender || undefined,
                },
            });
            if (response.data.statusCode === 200) {
                setUsers(response.data.data.content);
                setPagination({
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi component được render
    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, filters);
    }, []);

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        fetchUsers(newPagination.current, newPagination.pageSize, filters);
    };

    // Xử lý tìm kiếm
    const handleSearch = (value, type) => {
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);
        fetchUsers(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (value, type) => {
        const newFilters = { ...filters, [type]: value || '' };
        setFilters(newFilters);
        fetchUsers(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Định dạng giới tính
    const formatGender = (gender) => {
        switch (gender) {
            case 'MALE':
                return 'Nam';
            case 'FEMALE':
                return 'Nữ';
            case 'OTHER':
                return 'Khác';
            default:
                return gender;
        }
    };

    // Xử lý khi nhấn nút xem chi tiết
    const handleViewUser = (userId) => {
        setSelectedUserId(userId);
        setIsDetailModalVisible(true);
    };

    // Xử lý khi nhấn nút chỉnh sửa
    const handleEditUser = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalVisible(true);
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
            if (response.status === 200 || response.status === 204) {
                message.success('Xóa người dùng thành công!');
                fetchUsers(pagination.current, pagination.pageSize, filters);
            } else {
                message.error('Xóa người dùng thất bại.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            message.error('Đã xảy ra lỗi khi xóa người dùng.');
        } finally {
            setLoading(false);
        }
    };

    // Callback khi người dùng được cập nhật hoặc tạo mới
    const handleUserUpdated = () => {
        fetchUsers(pagination.current, pagination.pageSize, filters);
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id' },
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Vai trò', dataIndex: 'role', key: 'role' },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => formatGender(text),
        },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewUser(record.id)}
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record.id)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>Quản lý người dùng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalVisible(true)}
                >
                    Tạo mới
                </Button>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Tìm kiếm theo email"
                        onSearch={(value) => handleSearch(value, 'email')}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Tìm kiếm theo số điện thoại"
                        onSearch={(value) => handleSearch(value, 'phone')}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                        placeholder="Lọc vai trò"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange(value, 'role')}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="USER">USER</Option>
                        <Option value="ADMIN">ADMIN</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                        placeholder="Lọc giới tính"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange(value, 'gender')}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="MALE">Nam</Option>
                        <Option value="FEMALE">Nữ</Option>
                        <Option value="OTHER">Khác</Option>
                    </Select>
                </Col>
            </Row>

            {/* Bảng danh sách người dùng */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            {/* Modal xem chi tiết */}
            <UserDetailModal
                visible={isDetailModalVisible}
                userId={selectedUserId}
                onClose={() => setIsDetailModalVisible(false)}
                formatGender={formatGender}
                onEdit={handleEditUser}
            />

            {/* Modal chỉnh sửa */}
            <UserEditModal
                visible={isEditModalVisible}
                userId={selectedUserId}
                onClose={() => setIsEditModalVisible(false)}
                onUserUpdated={handleUserUpdated}
            />

            {/* Modal tạo người dùng */}
            <UserCreateModal
                open={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onUserCreated={handleUserUpdated}
            />
        </div>
    );
};

export default UserManagement;