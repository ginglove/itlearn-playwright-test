Bài 1: Dynamic Row Deletion & Table Counter Assertion
Website: TodoMVC React https://todomvc.com/examples/react/dist/
Mục tiêu: Thao tác thêm/xóa dòng trong bảng/danh sách động và kiểm tra bộ đếm tự động.
Yêu cầu kịch bản:
- Tạo 3 task mới: "Learn Playwright", "Practice Dynamic Table", "Master Smart Wait".
- Định vị dòng chứa task "Practice Dynamic Table".
- Rê chuột (hover) vào dòng đó để làm xuất hiện nút Xóa (destroy), sau đó click xóa.
- Assert bảng còn lại 2 dòng và nhãn hiển thị "2 items left!" cập nhật chính xác.

Bài tập 2: Dynamic Filter Table with Instant Search
Website: Wikipedia Table https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population
Mục tiêu: Thao tác bảng dữ liệu thống kê lớn có sẵn tính năng Sort built-in của Wikipedia.
Yêu cầu kịch bản:
- Truy cập bảng danh sách dân số các quốc gia trên Wikipedia.
- Click vào nút Sort của cột "Population" để xếp thứ tự từ nhỏ đến lớn.
- Đợi bảng hoàn tất việc sắp xếp lại các dòng (<tr>).
- Lấy thông tin quốc gia có dân số nhỏ nhất ở dòng đầu tiên của bảng và assert dữ liệu.

Bài tập 3: Wikipedia – Complex Multi-level Header Table
Mục tiêu: Xử lý bảng HTML có thẻ rowspan và colspan lồng nhau.
Mô tả kịch bản:
Truy cập https://en.wikipedia.org/wiki/List_of_highest_mountains_on_Earth
- Định vị dòng chứa thông tin ngọn núi "Mount Everest".
- Lấy độ cao ở ô dữ liệu tương ứng.
- Kiểm tra độ cao chứa giá trị "8,848".


Bài tập 4: Handsontable – Excel-like Web Spreadsheet Table
Mục tiêu: Tương tác với bảng dạng Excel trên Web (Cell Selection & Inline Edit).
Mô tả kịch bản:
Truy cập https://handsontable.com/docs/javascript-data-grid/demo/
- Định vị ô dữ liệu tại tọa độ cụ thể (Dòng 1 cột 3).
- Click đúp (dblclick()) vào ô đó để bật chế độ chỉnh sửa.
- Nhập giá trị mới và nhấn Enter.
- Assert giá trị mới đã được cập nhật vào ô dữ liệu.

Bài 5: Fastgames / Chess.com – Live Leaderboard Table
Mục tiêu: Xử lý bảng xếp hạng kỳ thủ trực tuyến cập nhật điểm số và trạng thái (Online/Playing).
Mô tả kịch bản:
Truy cập [https://www.chess.com/leaderboard/live](https://www.chess.com/leaderboard/live).
- Chờ bảng xếp hạng top kỳ thủ hiển thị.
- Định vị dòng của kỳ thủ xếp hạng #1.
- Lấy Tên (Username) và Điểm số (Rating) ở dòng đó.
- Assert điểm Rating là số nguyên lớn hơn 2000.