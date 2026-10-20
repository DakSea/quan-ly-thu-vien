// Dữ liệu sách mẫu; tài khoản người dùng được tạo qua đăng ký.
window.LibrarySeed = {
  categories: [
    {
      "id": 1,
      "name": "Văn học"
    },
    {
      "id": 2,
      "name": "Kỹ năng sống"
    },
    {
      "id": 3,
      "name": "Kinh tế"
    },
    {
      "id": 4,
      "name": "Khoa học"
    },
    {
      "id": 5,
      "name": "Lịch sử"
    },
    {
      "id": 6,
      "name": "Du lịch"
    }
  ],
  authors: [
    {
      "id": 1,
      "name": "Tô Hoài",
      "description": "Tác giả của Dế mèn phiêu lưu ký."
    },
    {
      "id": 2,
      "name": "Tố Hữu",
      "description": "Nhà thơ Việt Nam."
    },
    {
      "id": 3,
      "name": "Rosie Nguyễn",
      "description": "Tác giả viết về tuổi trẻ và trải nghiệm."
    },
    {
      "id": 4,
      "name": "Morgan Housel",
      "description": "Tác giả viết về tài chính và hành vi."
    },
    {
      "id": 5,
      "name": "Cao Minh",
      "description": "Tác giả Thiên tài bên trái, kẻ điên bên phải."
    },
    {
      "id": 6,
      "name": "Huyền Chip",
      "description": "Tác giả viết về trải nghiệm du lịch."
    },
    {
      "id": 7,
      "name": "Stephen Hawking",
      "description": "Nhà vật lý và tác giả sách khoa học."
    },
    {
      "id": 8,
      "name": "Nhiều tác giả",
      "description": "Tuyển tập và sách tham khảo."
    },
    {
      "id": 9,
      "name": "Hoài Thanh, Hoài Chân",
      "description": "Tác giả Thi nhân Việt Nam."
    }
  ],
  books: [
    {
      "id": 1,
      "title": "Dế mèn phiêu lưu ký",
      "authorId": 1,
      "categoryId": 1,
      "stock": 21,
      "pages": 194,
      "published": "2020-01-01",
      "isbn": "",
      "image": "de-men.jpg",
      "description": "Cùng Dế Mèn bước vào những chuyến phiêu lưu và học cách sống có trách nhiệm với bạn bè."
    },
    {
      "id": 2,
      "title": "Từ ấy",
      "authorId": 2,
      "categoryId": 1,
      "stock": 18,
      "pages": 180,
      "published": "2020-01-01",
      "isbn": "",
      "image": "tu-ay.jpg",
      "description": "Tập thơ đưa người đọc đến với những cảm xúc và lý tưởng của một thời tuổi trẻ."
    },
    {
      "id": 3,
      "title": "Tuổi trẻ đáng giá bao nhiêu?",
      "authorId": 3,
      "categoryId": 2,
      "stock": 30,
      "pages": 285,
      "published": "2021-01-01",
      "isbn": "",
      "image": "tuoi-tre.jpg",
      "description": "Những gợi ý gần gũi về tự học, làm việc và trải nghiệm để tận dụng quãng thời gian tuổi trẻ."
    },
    {
      "id": 4,
      "title": "Tâm lý học về tiền",
      "authorId": 4,
      "categoryId": 3,
      "stock": 15,
      "pages": 384,
      "published": "2022-01-01",
      "isbn": "",
      "image": "tam-ly-tien.jpg",
      "description": "Khám phá cách cảm xúc, thói quen và trải nghiệm ảnh hưởng đến những quyết định tài chính."
    },
    {
      "id": 5,
      "title": "Thiên tài bên trái, kẻ điên bên phải",
      "authorId": 5,
      "categoryId": 1,
      "stock": 20,
      "pages": 320,
      "published": "2021-01-01",
      "isbn": "",
      "image": "thien-tai.jpg",
      "description": "Những câu chuyện gợi mở nhiều góc nhìn về con người và thế giới xung quanh."
    },
    {
      "id": 6,
      "title": "Xách ba lô lên và đi",
      "authorId": 6,
      "categoryId": 6,
      "stock": 12,
      "pages": 300,
      "published": "2020-01-01",
      "isbn": "",
      "image": "ta-ba-lo.jpg",
      "description": "Câu chuyện về hành trình khám phá những vùng đất mới và tìm hiểu chính mình."
    },
    {
      "id": 7,
      "title": "Lược sử thời gian",
      "authorId": 7,
      "categoryId": 4,
      "stock": 16,
      "pages": 260,
      "published": "2022-01-01",
      "isbn": "",
      "image": "lich-su-thoi-gian.jpg",
      "description": "Một lời mời tìm hiểu vũ trụ, không gian và thời gian qua các câu hỏi khoa học."
    },
    {
      "id": 8,
      "title": "Kinh tế học",
      "authorId": 8,
      "categoryId": 3,
      "stock": 10,
      "pages": 450,
      "published": "2021-01-01",
      "isbn": "",
      "image": "kinh-te-hoc.jpg",
      "description": "Sách tham khảo giới thiệu những khái niệm cơ bản của kinh tế học."
    },
    {
      "id": 9,
      "title": "Thi nhân Việt Nam",
      "authorId": 9,
      "categoryId": 1,
      "stock": 22,
      "pages": 350,
      "published": "2020-01-01",
      "isbn": "",
      "image": "thi-nhan.jpg",
      "description": "Tuyển tập và bình luận về thơ mới Việt Nam, dành cho người yêu văn học."
    },
    {
      "id": 10,
      "title": "Làm chủ tuổi 20",
      "authorId": 8,
      "categoryId": 2,
      "stock": 25,
      "pages": 240,
      "published": "2022-01-01",
      "isbn": "",
      "image": "tuoi-20.jpg",
      "description": "Những bài học nhỏ về đặt mục tiêu, xây dựng thói quen và chăm sóc bản thân."
    },
    {
      "id": 11,
      "title": "Kỹ năng sống",
      "authorId": 8,
      "categoryId": 2,
      "stock": 30,
      "pages": 220,
      "published": "2021-01-01",
      "isbn": "",
      "image": "ky-nang-song.jpg",
      "description": "Các tình huống và bài học giúp rèn luyện kỹ năng ứng xử trong cuộc sống."
    },
    {
      "id": 12,
      "title": "Lịch sử Việt Nam",
      "authorId": 8,
      "categoryId": 5,
      "stock": 14,
      "pages": 420,
      "published": "2022-01-01",
      "isbn": "",
      "image": "lich-su-viet-nam.jpg",
      "description": "Sách tham khảo dành cho người muốn tìm hiểu các giai đoạn lịch sử Việt Nam."
    }
  ],
  version: 3,
  users: [],
  loans: []
};
