import { Typography, Table, Button, Input, Select } from 'antd';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
        title: 'Action', key: 'action', render: () => (
            <>
                <Button type="link">Edit</Button>
                <Button type="link" danger>Delete</Button>
            </>
        )
    },
];

const data = [
    { key: '1', id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER' },
];

const UserManagement = () => (
    <div>
        <Title level={2}>Quản lý người dùng</Title>
        <div className="mb-4 flex gap-4">
            {/* <Search placeholder="Search users" style={{ width: 300 }} />
            <Select placeholder="Role" style={{ width: 200 }}>
                <Option value="USER">User</Option>
                <Option value="ADMIN">Admin</Option>
            </Select> */}
            <Button type="primary">Filter</Button>
        </div>
        <Table columns={columns} dataSource={data} />
    </div>
);

export default UserManagement;