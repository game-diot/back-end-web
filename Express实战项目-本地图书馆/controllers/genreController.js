const genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// 显示所有的流派。
exports.genre_list = async function (req, res, next) {
  try {
    // 查询所有 Genre，并按名称升序排列
    const genre_list = await genre.find().sort({ name: 1 }).exec();

    // 渲染模板并传递数据
    res.render("genre_list", {
      title: "Genre List",
      genre_list: genre_list,
    });
  } catch (err) {
    next(err);
  }
};
// 显示特定流派的详情页。
const Genre = require("../models/genre");
const Book = require("../models/book");
const mongoose = require("mongoose");

// Display detail page for a specific Genre.
exports.genre_detail = async function (req, res, next) {
  try {
    const genreId = req.params.id;

    // 验证 ObjectId 是否有效
    if (!mongoose.Types.ObjectId.isValid(genreId)) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    // 使用 Promise.all 并行查询
    const [genre, genre_books] = await Promise.all([
      Genre.findById(genreId).exec(),
      Book.find({ genre: genreId }).exec(),
    ]);

    // 如果没找到该种类，抛出 404 错误
    if (!genre) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    // 渲染模板
    res.render("genre_detail", {
      title: "Genre Detail",
      genre,
      genre_books,
    });
  } catch (err) {
    next(err);
  }
};

// 通过 GET 显示创建流派。
// 呈现 GET 方法获取的 Genre 表单
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// 以 POST 方式处理创建流派。
// 处理 POST 方法创建的 Genre
exports.genre_create_post = [
  // 验证及清理名称字段
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // 处理验证及清理过后的请求
  asyncHandler(async (req, res, next) => {
    // 从请求中提取验证时产生的错误信息
    const errors = validationResult(req);

    // 使用经去除空白字符和转义处理的数据创建一个类型对象
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // 出现错误。使用清理后的值/错误信息重新渲染表单
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // 表格中的数据有效
      // 检查是否存在同名的 Genre
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (genreExists) {
        // 存在同名的 Genre，则重定向到详情页面
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // 保存新创建的 Genre，然后重定向到类型的详情页面
        res.redirect(genre.url);
      }
    }
  }),
];

// 通过 GET 显示流派删除表单。
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：流派删除 GET");
});

// 处理 POST 时的流派删除。
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：流派删除 POST");
});

// 通过 GET 显示流派更新表单。
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：流派更新 GET");
});

// 处理 POST 上的流派更新。
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：流派更新 POST");
});
