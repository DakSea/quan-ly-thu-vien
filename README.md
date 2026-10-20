# Website quản lý thư viện

Bài tập lớn môn Thiết kế web — Trường Đại học Giao thông vận tải, Khoa Quốc tế, lớp CNTT Việt Anh 1, Nhóm 8. Giảng viên giảng dạy: Lại Mạnh Dũng.

Dự án sử dụng HTML, CSS và JavaScript thuần; không cần framework, cài package hoặc bước build.

- [Mã nguồn trên GitHub](https://github.com/DakSea/quan-ly-thu-vien)
- [Báo cáo PDF để xem và tải](https://github.com/DakSea/quan-ly-thu-vien/blob/main/reports/Nhom8_PhamTrungHieu_252601048.pdf)
- [Phân công và tiến độ trên Trello](https://trello.com/b/PYrG6Ts0)

## Chạy website

1. Mở thư mục bằng VS Code.
2. Dùng tiện ích Live Server để mở `index.html` trên localhost, ví dụ `http://127.0.0.1:5500/index.html`. Giữ nguyên địa chỉ và cổng khi chuyển trang để dùng chung dữ liệu. Dùng trình duyệt hiện đại như Chrome, Edge hoặc Cốc Cốc; localhost hỗ trợ Web Crypto dùng cho mật khẩu.
3. Trang đầu là thư viện dành cho người dùng. Chọn **Đăng ký** để tạo tài khoản, sau đó **Đăng nhập**.
4. Tìm sách → **Mượn sách** → chọn **Thời hạn mượn** → **Xác nhận mượn sách**. Mỗi phiếu một bản; chọn thời hạn từ 1 đến 30 ngày trước khi xác nhận, mặc định 14 ngày.
5. Vào **Sách của tôi** để xem lịch sử riêng, nhấn **Yêu cầu trả sách**, rồi mang sách đến thư viện.
6. Vào **Hồ sơ người dùng** để cập nhật thông tin của tài khoản hiện tại.

## Đăng nhập admin

- Mở trực tiếp `pages/auth/admin-login.html` bằng Live Server. Giao diện người dùng không đặt liên kết quản trị ở chân trang.
- Tên đăng nhập khởi tạo: **admin**.
- Mật khẩu: **123**. Tài khoản admin đã lưu được cập nhật mật khẩu này một lần khi mở bản mới; không xóa người dùng hoặc lịch sử.
- Đăng nhập xong sẽ mở `pages/admin/index.html`.
- Admin quản lý sách, tác giả, danh mục, tài khoản đã đăng ký, báo cáo và xác nhận đã nhận sách. Không còn biểu mẫu chọn người dùng hoặc tạo người dùng thay cho đăng ký; tài khoản admin không dùng để mượn sách cá nhân.

Tài khoản admin là cấu hình cho bài tập cục bộ. Phân vai và xác thực chạy trong trình duyệt, không có máy chủ bảo vệ dữ liệu; cần backend khi triển khai thực tế.

## Dữ liệu khởi tạo và nâng cấp

- `js/data.js` chỉ có sách, tác giả và danh mục mẫu; `users` và `loans` là mảng rỗng.
- Khi lần đầu mở bản có tài khoản, dữ liệu cũ chưa có `version: 3` sẽ được nâng cấp: hoàn số bản của phiếu đang mượn, xóa người dùng và phiếu cũ theo yêu cầu, giữ sách/tác giả/danh mục.
- Bước này chỉ chạy một lần. Những tài khoản đăng ký sau khi nâng cấp được giữ lại qua các lần tải trang.
- Dữ liệu lưu ở `localStorage`, khóa `library-management-v2`; phiên đăng nhập ở `sessionStorage`, khóa `library-login`.
- Mật khẩu lưu bằng salt ngẫu nhiên và PBKDF2 SHA-256 với 100000 vòng lặp, không lưu mật khẩu dạng rõ. Vai trò đăng ký luôn là `user`.
- Mỗi tài khoản giữ một mã phiên đang có hiệu lực. Đăng nhập lại ở tab khác sẽ thay mã này; phiên cũ cần đăng nhập lại. Đóng tab sẽ kết thúc phiên lưu trong tab đó.
- Các tab cùng địa chỉ tải lại khi dữ liệu chung thay đổi. Chưa hỗ trợ giao dịch nhiều người cập nhật đồng thời hoặc đồng bộ giữa máy tính.
- Xóa dữ liệu trang trong trình duyệt sẽ mất tài khoản, sách đã chỉnh sửa và lịch sử; lần mở sau chỉ còn dữ liệu khởi tạo. Website không tự xóa dữ liệu khi gặp lỗi đọc hoặc sai định dạng.

## Cấu trúc chính

```text
index.html                     Trang chủ thư viện công khai
pages/auth/register.html       Đăng ký người dùng
pages/auth/login.html          Đăng nhập người dùng
pages/auth/admin-login.html    Đăng nhập admin
pages/admin/index.html         Tổng quan quản trị
pages/admin/                   Quản lý sách, tác giả, danh mục, người dùng, mượn trả và báo cáo
pages/reader/                  Tra cứu, chi tiết, lịch sử, hồ sơ và hướng dẫn
css/style.css                  Giao diện dùng chung
js/data.js                     Dữ liệu sách ban đầu
js/store.js                    Tài khoản, kiểm tra vai trò, nghiệp vụ và lưu trữ
js/common.js                   Điều hướng, kiểm tra trang, footer và hàm giao diện
js/auth.js                     Biểu mẫu đăng ký và đăng nhập
js/admin.js                    Hiển thị khu vực quản trị
js/reader.js                   Hiển thị khu vực người dùng
tests/                         Kiểm tra tài khoản, nghiệp vụ và tài nguyên HTML
reports/Nhom8_PhamTrungHieu_252601048.pdf  Báo cáo PDF để nộp bài
```

## Cách đọc JavaScript

`Library.ready` khởi tạo dữ liệu và admin. `AppReady` kiểm tra yêu cầu vai trò của trang trước khi hiển thị. `Library.currentUser` xác định tài khoản bằng id và mã phiên. Các trang lấy thông tin từ tài khoản này, không cho chọn người khác.

`store.js` dùng các hàm `requireAdmin` và `requireUser` trước khi thay đổi dữ liệu. `reader.js` gọi các hàm hiển thị `renderCatalog`, `renderBook`, `renderLoans`, `renderProfile`; `auth.js` nhận biểu mẫu và chuyển trang. Các hàm tạo bảng, thống kê, định dạng ngày được dùng chung từ `common.js`.

`stock` là số bản còn có thể cho mượn. Mượn giảm một bản; gửi yêu cầu trả chưa tăng số bản; admin xác nhận đã nhận sách mới tăng một bản. Tài khoản hoặc sách có lịch sử mượn không được xóa bằng chức năng quản trị thông thường.

## Kiểm tra

Kiểm tra tự động cần Node.js 20 trở lên; website chạy bình thường mà không cần Node.js. Tại thư mục dự án, chạy:

```sh
node --test
```

Bộ kiểm tra có 22 bài về tài khoản, vai trò, nghiệp vụ, nâng cấp dữ liệu, xử lý lỗi lưu trữ và tài nguyên của 18 trang HTML; không cần cài package.

Khi kiểm tra trực tiếp: đăng ký và đăng nhập → tìm sách → mượn thử 1 ngày và 30 ngày → xem Sách của tôi → gửi yêu cầu trả → đăng xuất → đăng nhập admin → tìm mã phiếu (ví dụ `PM001`) → xác nhận nhận sách. Kiểm tra số bản chỉ tăng sau bước xác nhận và phiếu đã chuyển sang Đã trả. Thử thêm sửa sách với số bản bằng 0, email trùng và menu trên màn hình hẹp.

## Báo cáo và phân công

Mở [báo cáo PDF](reports/Nhom8_PhamTrungHieu_252601048.pdf) để đọc hoặc nộp bài. Báo cáo có 32 trang A4, đã nhúng các hình minh họa và có mục lục cùng số trang; dung lượng dưới giới hạn 10 MB của biểu mẫu nộp bài. Nội dung đã đối chiếu với mã nguồn và kết quả 22 bài kiểm tra. Tệp đã được đặt tên theo mẫu `Nhóm_HoTenTruongNhom_MaSV.pdf`. Các bản báo cáo HTML và Markdown cũ đã được thay bằng PDF. Website không cần Python để hoạt động.

Báo cáo đã điền thông tin trường, khoa, giảng viên giảng dạy, lớp, Nhóm 8 và mã sinh viên theo thứ tự của 5 thành viên. Bảng tự đánh giá đã điền theo mức đóng góp: Hiếu 9.1; Tùng và Đức 8.9; Đăng 8.8; Hoàng 8.6. Điểm chung là trung bình cộng bốn tiêu chí.

| Thành viên | Mã sinh viên | Phụ trách |
| --- | --- | --- |
| Phạm Trung Hiếu | 252601048 | Giao diện chung, responsive, tích hợp, kiểm tra, README và báo cáo |
| Nguyễn Thanh Tùng | 252601095 | Lưu dữ liệu, phiếu mượn, thời hạn và xử lý trả sách |
| Nguyễn Minh Đức | 252601040 | Tài khoản, đăng ký, đăng nhập, hồ sơ và quản lý người dùng |
| Nguyễn Hải Đăng | 252601036 | Quản lý sách, tác giả, danh mục; tra cứu và chi tiết sách |
| Nguyễn Gia Hoàng | 252601050 | Tổng quan, báo cáo thống kê và phối hợp tổng hợp kết quả |

Bảng Trello có ba cột **Dự kiến**, **Đang làm**, **Xong**. Hai cột đầu đang trống; cột Xong gồm 8 thẻ chức năng đã triển khai. Checklist được giữ để đối chiếu tiêu chí; các công việc dự kiến ở phần hướng phát triển của báo cáo chưa được coi là đã triển khai. Nộp form là bước do nhóm thực hiện sau khi rà lại tệp và liên kết.
