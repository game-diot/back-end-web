const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // 并行获取书的详细信息、书实例、作者和体裁的数量
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

// 显示所有的图书
// 呈现数据库中所有书本的列表
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", { title: "Book List", book_list: allBooks });
});

// 显示特定图书的详情页面。
// 显示特定书籍的详细信息页面。
// 显示特定书籍的详细信息页面。
exports.book_detail = asyncHandler(async (req, res, next) => {
  // 获取书籍的详细信息，以及特定书籍的实例
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // 没有结果。
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});
const async = require("async");

// 通过 GET 显示创建图书。
// Display book create form on GET.
exports.book_create_get = async function (req, res, next) {
  try {
    // 使用 Promise.all 并行获取数据
    const [authors, genres] = await Promise.all([
      Author.find().exec(),
      Genre.find().exec(),
    ]);

    // 渲染页面
    res.render("book_form", {
      title: "Create Book",
      authors: authors,
      genres: genres,
    });
  } catch (err) {
    return next(err);
  }
};

// 以 POST 方式处理创建图书。
// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(), // 对数组中的每一项进行 escape

  // Process request after validation and sanitization.
  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) return next(err);

          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
    } else {
      book.save((err) => {
        if (err) return next(err);
        res.redirect(book.url);
      });
    }
  },
];

// 通过 GET 显示删除图书。
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：删除 GET");
});

// 以 POST 方式处理删除图书。
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：删除 POST");
});

// 通过 GET 显示更新图书。
exports.book_update_get = async function (req, res, next) {
  try {
    const [book, authors, genres] = await Promise.all([
      Book.findById(req.params.id).populate("author").populate("genre").exec(),
      Author.find().exec(),
      Genre.find().exec(),
    ]);

    if (!book) {
      const err = new Error("Book not found");
      err.status = 404;
      throw err;
    }

    // 标记已选择的 genre
    for (const genre of genres) {
      if (book.genre.some((g) => g._id.toString() === genre._id.toString())) {
        genre.checked = true;
      }
    }

    res.render("book_form", {
      title: "Update Book",
      authors,
      genres,
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book update on POST.
exports.book_update_post = [
  // Convert genre to array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = [req.body.genre];
      }
    }
    next();
  },

  // Validate and sanitize fields
  body("title", "Title must not be empty").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").trim().escape(),

  // Process request
  async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      _id: req.params.id, // 需要保持原ID
    });

    if (!errors.isEmpty()) {
      try {
        const [authors, genres] = await Promise.all([
          Author.find().exec(),
          Genre.find().exec(),
        ]);

        // 标记已选 genre
        for (const genre of genres) {
          if (book.genre.includes(genre._id.toString())) {
            genre.checked = true;
          }
        }

        res.render("book_form", {
          title: "Update Book",
          authors,
          genres,
          book,
          errors: errors.array(),
        });
      } catch (err) {
        next(err);
      }
      return;
    }

    try {
      const thebook = await Book.findByIdAndUpdate(req.params.id, book, {
        new: true,
      });
      res.redirect(thebook.url);
    } catch (err) {
      next(err);
    }
  },
];
