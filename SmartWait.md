Bài tập 1: E-commerce Filter & Dynamic Catalog
Website: Amazon https://www.amazon.com

Mục tiêu: Thao tác tìm kiếm, lọc sản phẩm động và kiểm tra danh sách kết quả.

Yêu cầu kịch bản:

Tìm kiếm từ khóa "wireless headphones".

Lọc danh sách theo Thương hiệu (Brand) bất kỳ ở cột bên trái (ví dụ: Sony hoặc JBL).

Lấy tất cả tên sản phẩm hiển thị ở trang đầu tiên.

Assert xem 100% các tên sản phẩm lấy được có chứa tên thương hiệu đã chọn hay không.

Bài tập 2: Multi-stage Loader & Button State Change
Website: https://www.google.com/travel/flights

Kỹ năng: waitForSelector() với trạng thái State, Custom Timeout

Mục tiêu: Xử lý thanh progress bar / icon loading chạy trong thời gian dài.

Yêu cầu kịch bản:

Tìm chuyến bay khứ hồi bất kỳ.

Nhấp "Tìm kiếm" và xác định element hiển thị trạng thái "Searching / Progress bar".

Sử dụng Playwright để chờ tiến trình tìm kiếm hoàn tất (state: 'detached' hoặc state: 'hidden').

Kiểm tra nút "Filter" hoặc danh sách chuyến bay đã sẵn sàng để tương tác.