const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");

// 显示所有的 BookInstances
// 呈现所有书本实例（BookInstance）的列表
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// 显示特定 BookInstance 的详情页
// 展示特定 BookInstance 的详情页。
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // 没有结果。
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// 由 GET 显示创建 BookInstance 的表单
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 创建 GET");
});

// 由 POST 处理创建 BookInstance
exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 创建 POST");
});

// 由 GET 显示删除 BookInstance 的表单
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 删除 GET");
});

// 由 POST 删除 BookInstance
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 删除 POST");
});

// 由 GET 显示更新 BookInstance 的表单
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 更新 GET");
});

// 由 POST 处理更新 BookInstance
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("未实现：BookInstance 更新 POST");
});
