import { Typography, Button, Image } from 'antd';

const { Title, Paragraph } = Typography;

const ProductDetail = () => (
    <div>
        <Title level={2}>Product Name</Title>
        <Image width={300} src="https://via.placeholder.com/300" />
        <Paragraph>Price: $99.99</Paragraph>
        <Paragraph>Brand: Apple</Paragraph>
        <Paragraph>Category: Electronics</Paragraph>
        <Paragraph>Description: This is a high-quality product.</Paragraph>
        <Button type="primary">Add to Cart</Button>
    </div>
);

export default ProductDetail;