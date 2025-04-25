import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import Home from './pages/user/Home';
import ProductList from './pages/user/ProductList';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import Login from './pages/user/Login';
import Logout from './pages/user/Logout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
// import 'antd/dist/reset.css';

const { Content, Header: AntHeader, Footer: AntFooter } = Layout;

const HomeLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <AntHeader style={{ padding: 0 }}>
      <Header />
    </AntHeader>
    <Content style={{ padding: 24 }}>
      {children}
    </Content>
    <AntFooter style={{ textAlign: 'center' }}>
      <Footer />
    </AntFooter>
  </Layout>
);

const UserLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <AntHeader style={{ padding: 0 }}>
      <Header />
    </AntHeader>
    <Layout>
      <Sidebar />
      <Content style={{ padding: 24 }}>
        {children}
      </Content>
    </Layout>
    <AntFooter style={{ textAlign: 'center' }}>
      <Footer />
    </AntFooter>
  </Layout>
);

const AdminLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <AntHeader style={{ padding: 0 }}>
      <AdminHeader />
    </AntHeader>
    <Layout>
      <AdminSidebar />
      <Content style={{ padding: 24 }}>
        {children}
      </Content>
    </Layout>
    <AntFooter style={{ textAlign: 'center' }}>
      <Footer />
    </AntFooter>
  </Layout>
);

function App() {
  return (
    <div className="ant-wrapper">
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
        <Route path="/products" element={<HomeLayout><ProductList /></HomeLayout>} />
        <Route path="/products/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
        <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
        <Route path="/orders" element={<UserLayout><Orders /></UserLayout>} />
        <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />

        {/* Redirect to Home for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;