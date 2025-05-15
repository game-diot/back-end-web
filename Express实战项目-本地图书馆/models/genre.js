const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 定义图书种类的 Schema
const BookCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
});

// 虚拟属性 `url`，返回类别的 URL
BookCategorySchema.virtual("url").get(function () {
  return `/categories/${this._id}`;
});

// 确保虚拟属性会出现在 JSON 转换中
BookCategorySchema.set("toJSON", { virtuals: true });
BookCategorySchema.set("toObject", { virtuals: true });

// 导出模型
module.exports = mongoose.model("BookCategory", BookCategorySchema);
