# Book Library — giao diện admin

Chỉ HTML, CSS và JavaScript thuần. Không có backend, API, Java, Maven, MySQL hoặc bước build.

## Cách mở

Mở thư mục trong VS Code, nhấp phải `index.html` → **Open with Live Server**. Trang tổng quan admin mở trực tiếp, không cần đăng nhập. Live Server chỉ phục vụ file frontend tĩnh.

Có thể đưa nguyên thư mục lên hosting tĩnh. Nên dùng Live Server hoặc hosting tĩnh để các trang dùng chung localStorage, thay vì mở từng file bằng `file://`.

## Cấu trúc

```text
index.html                Tổng quan admin
pages/admin/books.html    Danh sách sách
pages/admin/book.html     Thêm / sửa sách
pages/admin/categories.html  Danh mục
pages/admin/authors.html   Tác giả
pages/admin/users.html     Danh sách khách hàng
pages/admin/user.html      Sửa thông tin khách hàng
pages/admin/orders.html    Danh sách đơn hàng
pages/admin/order.html     Chi tiết / duyệt / hủy đơn
css/style.css             Giao diện dùng chung
js/data.js                Dữ liệu mẫu
js/store.js               Các thao tác dữ liệu trong trình duyệt
js/common.js              Menu, footer, hàm hiển thị
js/admin.js               Các màn hình admin
images/books/             Ảnh bìa sách
tests/                    Kiểm tra JavaScript
```

Đã bỏ toàn bộ trang cửa hàng, giỏ hàng, đặt hàng của người mua, đăng nhập/đăng ký và hồ sơ cá nhân.

## Dữ liệu mẫu

Sách, khách hàng và đơn hàng lưu trong localStorage, chỉ tồn tại trong trình duyệt đang dùng. Đây là giao diện admin mô phỏng cho bài tập frontend.

Lần mở đầu tiên có sẵn khách hàng và đơn hàng mẫu để xem hoặc thử duyệt/hủy đơn. Nếu đã dùng bản trước, danh mục sách, khách hàng và đơn hàng đã lưu được giữ lại; dữ liệu đăng nhập, giỏ hàng và đánh giá được bỏ.

Ảnh bìa tải lên: JPG, PNG hoặc WebP, tối đa 500 KB. Khi bộ nhớ đầy hoặc bị chặn, trang báo lỗi và giữ nguyên dữ liệu trước thao tác.

Để quay lại dữ liệu mẫu ban đầu, xóa khóa `book-library-v1` trong Local Storage của trang rồi tải lại.

## Kiểm tra (tùy chọn)

Nếu có Node.js, chạy `node --test`. Không cần cài npm hoặc thư viện để chạy frontend.
