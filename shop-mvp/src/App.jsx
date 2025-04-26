import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/user/Home';
import ProductList from './pages/user/ProductList';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import Login from './pages/user/Login';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Register from './pages/user/Register';
import ChangePassword from './pages/user/ChangePassword';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ForgotPassword from './pages/user/ForgotPassword';

const { Content, Header: AntHeader, Footer: AntFooter } = Layout;

// Layout chính để quản lý header động
const MainLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AntHeader style={{ padding: 0 }}>
        {isAdminRoute ? <AdminHeader /> : <Header />}
      </AntHeader>
      <div className="ant-wrapper">
        <Outlet /> {/* Render các route con */}
      </div>
      <AntFooter style={{ textAlign: 'center' }}>
        <Footer />
      </AntFooter>
    </Layout>
  );
};

// Layout cho các trang user không có Sidebar
const HomeLayout = ({ children }) => (
  <Layout>

    <Content style={{ padding: 24 }}>
      {children}
    </Content>
  </Layout>
);

// Layout cho các trang user có Sidebar
const UserLayout = ({ children }) => (
  <Layout>
    <Sidebar /> {/* Sidebar có width mặc định là 200px */}
    <Content style={{ padding: 24 }}>
      {children}
    </Content>
  </Layout>
);

// Layout cho các trang admin
const AdminLayout = ({ children }) => (
  <Layout>
    <AdminSidebar />
    <Content style={{ padding: 24 }}>
      {children}
    </Content>
  </Layout>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Sử dụng MainLayout làm layout cấp cao */}
          <Route element={<MainLayout />}>
            {/* Public Routes - Không cần đăng nhập */}
            <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
            <Route path="/products" element={<HomeLayout><ProductList /></HomeLayout>} />
            <Route path="/products/:id" element={<UserLayout><ProductDetail /></UserLayout>} />

            {/* Protected Routes - Yêu cầu đăng nhập */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Cart />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Orders />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Profile />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <ChangePassword />
                  </UserLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Yêu cầu đăng nhập và vai trò ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <ProductManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Các route không cần layout (như login/register) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Redirect to Home for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;