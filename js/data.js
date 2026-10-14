// Dữ liệu mẫu cho bài tập frontend; giá và số lượng chỉ dùng để minh họa.
window.LibrarySeed = {
  categories: [
    { id: 1, name: 'Văn học' }, { id: 2, name: 'Kỹ năng sống' },
    { id: 3, name: 'Kinh tế' }, { id: 4, name: 'Khoa học' },
    { id: 5, name: 'Lịch sử' }, { id: 6, name: 'Du lịch' }
  ],
  authors: [
    { id: 1, name: 'Tô Hoài', description: 'Tác giả của Dế mèn phiêu lưu ký.' },
    { id: 2, name: 'Tố Hữu', description: 'Nhà thơ Việt Nam.' },
    { id: 3, name: 'Rosie Nguyễn', description: 'Tác giả viết về tuổi trẻ và trải nghiệm.' },
    { id: 4, name: 'Morgan Housel', description: 'Tác giả viết về tài chính và hành vi.' },
    { id: 5, name: 'Cao Minh', description: 'Tác giả Thiên tài bên trái, kẻ điên bên phải.' },
    { id: 6, name: 'Huyền Chip', description: 'Tác giả viết về trải nghiệm du lịch.' },
    { id: 7, name: 'Stephen Hawking', description: 'Nhà vật lý và tác giả sách khoa học.' },
    { id: 8, name: 'Nhiều tác giả', description: 'Tuyển tập và sách tham khảo.' },
    { id: 9, name: 'Hoài Thanh, Hoài Chân', description: 'Tác giả Thi nhân Việt Nam.' }
  ],
  books: [
    { id: 1, title: 'Dế mèn phiêu lưu ký', authorId: 1, categoryId: 1, price: 65000, stock: 22, sold: 98, pages: 194, published: '2020-01-01', image: 'de-men.jpg', description: 'Cùng Dế Mèn bước vào những chuyến phiêu lưu và học cách sống có trách nhiệm với bạn bè.' },
    { id: 2, title: 'Từ ấy', authorId: 2, categoryId: 1, price: 55000, stock: 18, sold: 42, pages: 180, published: '2020-01-01', image: 'tu-ay.jpg', description: 'Tập thơ đưa người đọc đến với những cảm xúc và lý tưởng của một thời tuổi trẻ.' },
    { id: 3, title: 'Tuổi trẻ đáng giá bao nhiêu?', authorId: 3, categoryId: 2, price: 85000, stock: 31, sold: 121, pages: 285, published: '2021-01-01', image: 'tuoi-tre.jpg', description: 'Những gợi ý gần gũi về tự học, làm việc và trải nghiệm để tận dụng quãng thời gian tuổi trẻ.' },
    { id: 4, title: 'Tâm lý học về tiền', authorId: 4, categoryId: 3, price: 150000, stock: 15, sold: 78, pages: 384, published: '2022-01-01', image: 'tam-ly-tien.jpg', description: 'Khám phá cách cảm xúc, thói quen và trải nghiệm ảnh hưởng đến những quyết định tài chính.' },
    { id: 5, title: 'Thiên tài bên trái, kẻ điên bên phải', authorId: 5, categoryId: 1, price: 125000, stock: 20, sold: 64, pages: 320, published: '2021-01-01', image: 'thien-tai.jpg', description: 'Những câu chuyện gợi mở nhiều góc nhìn về con người và thế giới xung quanh.' },
    { id: 6, title: 'Xách ba lô lên và đi', authorId: 6, categoryId: 6, price: 95000, stock: 12, sold: 38, pages: 300, published: '2020-01-01', image: 'ta-ba-lo.jpg', description: 'Câu chuyện về hành trình khám phá những vùng đất mới và tìm hiểu chính mình.' },
    { id: 7, title: 'Lược sử thời gian', authorId: 7, categoryId: 4, price: 135000, stock: 16, sold: 55, pages: 260, published: '2022-01-01', image: 'lich-su-thoi-gian.jpg', description: 'Một lời mời tìm hiểu vũ trụ, không gian và thời gian qua các câu hỏi khoa học.' },
    { id: 8, title: 'Kinh tế học', authorId: 8, categoryId: 3, price: 180000, stock: 10, sold: 27, pages: 450, published: '2021-01-01', image: 'kinh-te-hoc.jpg', description: 'Sách tham khảo giới thiệu những khái niệm cơ bản của kinh tế học.' },
    { id: 9, title: 'Thi nhân Việt Nam', authorId: 9, categoryId: 1, price: 90000, stock: 22, sold: 61, pages: 350, published: '2020-01-01', image: 'thi-nhan.jpg', description: 'Tuyển tập và bình luận về thơ mới Việt Nam, dành cho người yêu văn học.' },
    { id: 10, title: 'Làm chủ tuổi 20', authorId: 8, categoryId: 2, price: 75000, stock: 25, sold: 31, pages: 240, published: '2022-01-01', image: 'tuoi-20.jpg', description: 'Những bài học nhỏ về đặt mục tiêu, xây dựng thói quen và chăm sóc bản thân.' },
    { id: 11, title: 'Kỹ năng sống', authorId: 8, categoryId: 2, price: 70000, stock: 30, sold: 45, pages: 220, published: '2021-01-01', image: 'ky-nang-song.jpg', description: 'Các tình huống và bài học giúp rèn luyện kỹ năng ứng xử trong cuộc sống.' },
    { id: 12, title: 'Lịch sử Việt Nam', authorId: 8, categoryId: 5, price: 160000, stock: 14, sold: 29, pages: 420, published: '2022-01-01', image: 'lich-su-viet-nam.jpg', description: 'Sách tham khảo dành cho người muốn tìm hiểu các giai đoạn lịch sử Việt Nam.' }
  ],
  users: [
    { id: 2, name: 'Nguyễn An', username: 'nguyenan', role: 'user', email: 'an@example.com', phone: '0901234567', address: 'Địa chỉ mẫu tại Hà Nội' },
    { id: 3, name: 'Trần Bình', username: 'tranbinh', role: 'user', email: 'binh@example.com', phone: '0907654321', address: 'Địa chỉ mẫu tại TP. Hồ Chí Minh' }
  ],
  orders: [
    { id: 1, userId: 2, name: 'Nguyễn An', phone: '0901234567', address: 'Địa chỉ mẫu tại Hà Nội', status: 'Đang chờ duyệt', created: '2026-10-13T02:00:00Z', total: 130000, items: [{ bookId: 1, title: 'Dế mèn phiêu lưu ký', price: 65000, quantity: 2 }] },
    { id: 2, userId: 3, name: 'Trần Bình', phone: '0907654321', address: 'Địa chỉ mẫu tại TP. Hồ Chí Minh', status: 'Đã giao', created: '2026-10-12T03:00:00Z', total: 85000, items: [{ bookId: 3, title: 'Tuổi trẻ đáng giá bao nhiêu?', price: 85000, quantity: 1 }] }
  ]
};
