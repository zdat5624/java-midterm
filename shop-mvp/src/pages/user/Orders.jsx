import { Typography, Table } from 'antd';

const { Title } = Typography;

const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
];

const data = [
    { key: '1', id: '123', date: '2025-04-25', total: '$149.99', status: 'Pending' },
];

const Orders = () => (
    <div>
        <Title level={2}>Your Orders</Title>
        <Table columns={columns} dataSource={data} />
    </div>
);

export default Orders;