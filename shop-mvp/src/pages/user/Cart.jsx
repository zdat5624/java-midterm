import { Typography, Table, Button } from 'antd';

const { Title } = Typography;

const columns = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Action', key: 'action', render: () => <Button danger>Remove</Button> },
];

const data = [
    { key: '1', name: 'Product 1', quantity: 2, price: '$99.99' },
    { key: '2', name: 'Product 2', quantity: 1, price: '$49.99' },
];

const Cart = () => (
    <div>
        <Title level={2}>Your Cart</Title>
        <Table columns={columns} dataSource={data} />
        <Button type="primary">Proceed to Checkout</Button>
    </div>
);

export default Cart;