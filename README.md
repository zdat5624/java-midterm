# SpringCommerce - Ứng dụng mua sắm trực tuyến MVP

## Nguyên tắc, Mẫu thiết kế và Thực tiễn phát triển phần mềm

### Nguyên tắc phát triển phần mềm
- **SOLID**:
  - **Single Responsibility Principle**: Mỗi class backend (ví dụ: `ProductController`, `ProductService`) và component React (ví dụ: `ProductList`, `Cart`) chỉ đảm nhiệm một chức năng duy nhất, đảm bảo tách biệt trách nhiệm.
  - **Dependency Inversion Principle**: Spring Boot sử dụng dependency injection để quản lý các thành phần backend, giảm sự phụ thuộc trực tiếp giữa các module.
- **DRY (Don't Repeat Yourself)**: Tái sử dụng các service backend (như `ProductService` để lọc sản phẩm) và component React (như `ProductCard`) để tránh lặp mã.
- **KISS (Keep It Simple, Stupid)**: Ứng dụng tập trung vào các tính năng cốt lõi (hiển thị sản phẩm, lọc, giỏ hàng, đặt hàng) để triển khai MVP nhanh chóng.

### Mẫu thiết kế
- **RESTful API Architecture**: Backend sử dụng Spring Boot để cung cấp các API RESTful, tách biệt với frontend React, đảm bảo giao tiếp hiệu quả qua các endpoint như `/api/products`, `/api/cart`, `/api/orders`.
- **Repository Pattern**: Sử dụng Spring Data JPA (`ProductRepository`, `OrderRepository`) để quản lý truy cập cơ sở dữ liệu MySQL một cách trừu tượng và hiệu quả.
- **Dependency Injection**: Spring Boot quản lý các bean (services, repositories) để tăng tính mô-đun và dễ kiểm thử.
- **Component-Based Architecture**: Frontend React sử dụng các component tái sử dụng như `ProductList`, `Filter`, `Cart` để xây dựng giao diện người dùng động.

### Thực tiễn phát triển phần mềm
- **RESTful API Design**: Các API được thiết kế theo chuẩn REST, hỗ trợ các thao tác CRUD và lọc sản phẩm theo danh mục, giá, thương hiệu, màu sắc.
- **Bảo mật**: Sử dụng **Spring Security** để bảo vệ các endpoint API, yêu cầu xác thực cho các thao tác nhạy cảm như đặt hàng.
- **Kiểm thử**:
  - Backend sử dụng `spring-boot-starter-test` và `spring-security-test` để kiểm thử các chức năng như lọc sản phẩm, thêm vào giỏ hàng, và đặt hàng.
  - Frontend sử dụng Jest hoặc React Testing Library để kiểm thử các component.
- **Phát triển Frontend**:
  - Sử dụng **React** với `react-router-dom` để điều hướng, `axios` để gọi API, và `antd` để tạo giao diện đẹp, nhất quán.
  - **TailwindCSS** giúp xây dựng giao diện responsive nhanh chóng.
  - **Vite** được sử dụng làm công cụ build để tăng tốc phát triển và build sản phẩm.
  - **ESLint** đảm bảo chất lượng mã frontend, tuân thủ các quy chuẩn code.
- **Quản lý cơ sở dữ liệu**: Sử dụng MySQL với Spring Data JPA để quản lý dữ liệu sản phẩm, giỏ hàng, và đơn hàng.

---

## Cấu trúc mã nguồn

Dự án được chia thành hai phần chính: **backend** (Spring Boot) và **frontend** (React). Cấu trúc mã nguồn được tổ chức như sau:

### Backend (Spring Boot)
```
src/
├── main/
│   ├── java/vn/tdtu/shop/
│   │   ├── config/          # Cấu hình Spring Boot, Spring Security
│   │   ├── controller/      # REST controllers (ProductController, OrderController)
│   │   ├── domain/          # Entity classes (Product, Cart, Order)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── service/         # Business logic (ProductService, OrderService)
│   │   └── ShopApplication.java  # Main class
│   └── resources/
│       ├── application.properties  # Cấu hình database, Spring
│       └── static/          # Tài nguyên tĩnh (nếu có)
├── test/                    # Unit tests
```

### Frontend (React)
```
src/
├── assets/                  # Hình ảnh, tài nguyên tĩnh
├── components/              # Các component React (ProductList, Cart, Filter)
├── pages/                   # Các page (Home, ProductDetail, Checkout)
├── App.jsx                  # Component chính
├── index.jsx                # Entry point
└── package.json             # Cấu hình dependencies và scripts
```

---

## Hướng dẫn cài đặt và chạy ứng dụng

### Yêu cầu
- **Backend**:
  - Java 17
  - Maven
  - MySQL (phiên bản 8.x)
- **Frontend**:
  - Node.js (phiên bản 18.x hoặc cao hơn)
  - npm hoặc yarn
- Máy tính có kết nối internet để tải dependencies.

### Các bước cài đặt
1. **Chuẩn bị cơ sở dữ liệu**:
   - Cài đặt MySQL và tạo database:
     ```sql
     CREATE DATABASE springcommerce;
     ```
   - Cập nhật thông tin database trong `src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/springcommerce
     spring.datasource.username=root
     spring.datasource.password=your_password
     spring.jpa.hibernate.ddl-auto=update
     ```

2. **Chạy backend**:
   - Clone repository:
     ```bash
     git clone <repository_url>
     cd shop
     ```
   - Build và chạy ứng dụng Spring Boot:
     ```bash
     mvn clean install
     mvn spring-boot:run
     ```
   - Backend sẽ chạy tại `http://localhost:8080`.

3. **Chạy frontend**:
   - Điều hướng đến thư mục frontend:
     ```bash
     cd frontend
     ```
   - Cài đặt dependencies:
     ```bash
     npm install
     ```
   - Chạy ứng dụng React:
     ```bash
     npm run dev
     ```
   - Frontend sẽ chạy tại `http://localhost:5173` (hoặc cổng mặc định của Vite).

4. **Truy cập ứng dụng**:
   - Mở trình duyệt và truy cập `http://localhost:5173` để sử dụng giao diện người dùng.
   - API backend có thể được kiểm tra tại `http://localhost:8080/api`.