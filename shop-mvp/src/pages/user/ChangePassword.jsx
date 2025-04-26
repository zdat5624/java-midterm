import { Typography, Form, Input, Button, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const ChangePassword = () => (
    <div>
        <Title level={2}>Đổi mật khẩu</Title>
        <Form layout="vertical">
            <Form.Item label="Password">
                <Input placeholder="Enter your password" />
            </Form.Item>
            <Form.Item label="Password">
                <Input placeholder="Enter your password" />
            </Form.Item><Form.Item label="Password">
                <Input placeholder="Enter your password" />
            </Form.Item>
            <Button type="primary">Save Changes</Button>
        </Form>
    </div>
);

export default ChangePassword;