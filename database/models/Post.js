const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    value: { type: String, lowercase: true, required: true },
    label: { type: String, required: true },
    bgColor: { type: String, required: true },
    textColor: { type: String, required: true }
  },
  { _id: false }
);

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

const PostSchema = new Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categories: [CategorySchema],
    comments: [CommentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
