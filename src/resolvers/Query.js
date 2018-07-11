const verify = require('jsonwebtoken').verify;
const GraphQLError = require('graphql').GraphQLError;

const Post = require('../../database/models/Post');

const categories = [
  {
    value: 'js',
    label: 'JavaScript',
    bgColor: '#fce759',
    textColor: '#000'
  },
  {
    value: 'reactjs',
    label: 'ReactJS',
    bgColor: '#2BA6EE',
    textColor: '#fff'
  }
];

const specialChar = ['*', '$', '^', '.', '[', '+', '?', '|', '(', ')', '{'];
const filterDefault = { title: '', categories: [], sortby: '' };

module.exports = {
  feed: async ({ filter = filterDefault, skip = 0, limit = 0 }) => {
    const filterObj = {};

    if (filter.title) {
      for (let i = 0; specialChar[i]; i++) {
        filter.title = filter.title.replace(
          specialChar[i],
          `\\${specialChar[i]}`
        );
      }
      filterObj.title = { $regex: filter.title, $options: 'i' };
    }
    if (
      filter.categories &&
      filter.categories instanceof Array &&
      filter.categories.length > 0
    )
      filterObj.categories = {
        $in: filter.categories
      };

    const count = await Post.find(filterObj).then(posts => posts.length);
    const filteredPosts = await Post.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author')
      .populate('comments.author')
      .exec()
      .then(posts => posts);

    return { articles: filteredPosts, count };
  },
  getPost: ({ id }) => {
    return Post.findById(id)
      .populate('author')
      .populate('comments.author')
      .exec()
      .then(post => post)
      .catch(() => {
        throw new GraphQLError("Can't find post with such id.");
      });
  },
  getCategories: () => {
    return categories;
  },
  verifyJWT: ({ token }) => {
    return verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) return err;
      if (decoded) return decoded;
    });
  }
};
