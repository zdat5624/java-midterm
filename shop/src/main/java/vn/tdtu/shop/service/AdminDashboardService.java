package vn.tdtu.shop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.tdtu.shop.repository.OrderRepository;
import vn.tdtu.shop.repository.UserRepository;
import vn.tdtu.shop.util.constant.OrderStatus;
import vn.tdtu.shop.util.response.AdminDashboardDTO;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminDashboardDTO getDashboardData() {
        AdminDashboardDTO dashboard = new AdminDashboardDTO();
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        // Tổng doanh thu năm hiện tại
        Instant yearStart = LocalDate.of(currentYear, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant yearEnd = LocalDate.of(currentYear + 1, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        BigDecimal yearRevenue = orderRepository.calculateRevenueBetweenDates(yearStart, yearEnd);
        dashboard.setCurrentYearRevenue(yearRevenue != null ? yearRevenue : BigDecimal.ZERO);

        // Tổng doanh thu tháng hiện tại
        Instant monthStart = LocalDate.of(currentYear, currentMonth, 1).atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        Instant monthEnd = LocalDate.of(currentYear, currentMonth + 1, 1).atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        BigDecimal monthRevenue = orderRepository.calculateRevenueBetweenDates(monthStart, monthEnd);
        dashboard.setCurrentMonthRevenue(monthRevenue != null ? monthRevenue : BigDecimal.ZERO);

        // Tổng số user
        dashboard.setTotalUsers(userRepository.count());

        // Số đơn hàng chờ duyệt
        dashboard.setPendingOrders(orderRepository.countByStatus(OrderStatus.PENDING));

        // Biểu đồ doanh thu theo tháng
        List<AdminDashboardDTO.MonthlyRevenueDTO> yearlyRevenueChart = new ArrayList<>();
        List<Object[]> monthlyRevenues = orderRepository.getMonthlyRevenueForYear(currentYear);

        // Khởi tạo doanh thu cho 12 tháng
        for (int month = 1; month <= 12; month++) {
            AdminDashboardDTO.MonthlyRevenueDTO monthlyRevenue = new AdminDashboardDTO.MonthlyRevenueDTO();
            monthlyRevenue.setMonth(month);
            monthlyRevenue.setRevenue(BigDecimal.ZERO);
            yearlyRevenueChart.add(monthlyRevenue);
        }

        // Cập nhật doanh thu từ dữ liệu truy vấn
        for (Object[] result : monthlyRevenues) {
            int month = ((Number) result[0]).intValue();
            BigDecimal revenue = (BigDecimal) result[1];
            yearlyRevenueChart.get(month - 1).setRevenue(revenue);
        }
        dashboard.setYearlyRevenueChart(yearlyRevenueChart);

        return dashboard;
    }
}