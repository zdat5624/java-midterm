import { Typography, Table, Button, Input } from 'antd';

const { Title } = Typography;
const { Search } = Input;

const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
        title: 'Action', key: 'action', render: () => (
            <Button type="link">Update Status</Button>
        )
    },
];

const data = [
    { key: '1', id: '123', date: '2025-04-25', total: '$149.99', status: 'Pending' },
];

const OrderManagement = () => (
    <div>
        <Title level={2}>Order Management</Title>
        <div className="mb-4 flex gap-4">
            <Search placeholder="Search orders" style={{ width: 300 }} />
            <Button type="primary">Filter</Button>
        </div>
        <Table columns={columns} dataSource={data} />
    </div>
);

export default OrderManagement;