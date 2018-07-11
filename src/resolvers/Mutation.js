const GraphQLError = require('graphql').GraphQLError;
const User = require('../../database/models/User');
const Post = require('../../database/models/Post');

module.exports = {
  signup: ({ username, email, password, fullName, avatar }) => {
    return User.findOne({ username })
      .then(foundUser => {
        if (!foundUser) {
          if (!avatar)
            avatar = `https://api.adorable.io/avatars/200/${email}.png`;
          const user = new User({
            username,
            email,
            fullName,
            role: 'user',
            avatar
          });
          return user.setPassword(password).then(() =>
            user.save().then(userInfo => ({
              token: userInfo.generateJWT(),
              user: {
                id: userInfo._id,
                username: userInfo.username,
                email: userInfo.email,
                fullName: userInfo.fullName,
                role: userInfo.role,
                avatar: userInfo.avatar
              }
            }))
          );
        }
        if (foundUser) {
          throw new GraphQLError('User with this username already exists.');
        }
      })
      .catch(err => {
        if (err.errors && err.errors.email.path === 'email')
          throw new GraphQLError('User with this email already exists.');
        throw err;
      });
  },
  signin: ({ username, password }) =>
    User.findOne({ username })
      .then(foundUser => {
        const error = new GraphQLError('Invalid credentials.');
        if (!foundUser) throw error;
        if (foundUser) {
          return foundUser.isValidPassword(password).then(result => {
            if (result)
              return {
                token: foundUser.generateJWT(),
                user: {
                  id: foundUser._id,
                  username: foundUser.username,
                  email: foundUser.email,
                  fullName: foundUser.fullName,
                  role: foundUser.role,
                  avatar: foundUser.avatar
                }
              };
            else throw error;
          });
        }
      })
      .catch(err => {
        throw err;
      }),
  createPost: ({ input }, context) => {
    if (context.user) {
      const { img, title, text, categories } = input;
      return User.findById(context.user.id)
        .then(user => {
          const post = new Post({
            img,
            title,
            text,
            categories,
            author: user._id
          });

          return post.save().then(postData => {
            const { id, username, email, fullName, role } = user;
            return Object.assign(
              {},
              postData._doc,
              {
                author: { id, username, email, fullName, role }
              },
              { id: postData._id }
            );
          });
        })
        .catch(e => {
          throw new GraphQLError("Can't find user with such id.");
        });
    } else {
      throw new GraphQLError('Must be logged in.');
    }
  },
  updatePost: ({ id, input }, context) => {
    if (context.user) {
      return Post.findOneAndUpdate({ _id: id }, input, { new: true }).then(
        post => post
      );
    } else {
      throw new GraphQLError('Must be logged in.');
    }
  },
  deletePost: ({ id }, context) => {
    if (context.user) {
      return Post.findOneAndRemove({ _id: id }).then(post => post);
    } else {
      throw new GraphQLError('Must be logged in.');
    }
  },
  addCommentToPost: ({ postId, commentText }, context) => {
    if (context.user) {
      return User.findById(context.user.id)
        .then(user => {
          const { id, username, email, fullName, role, avatar } = user;
          const newComment = {
            text: commentText,
            createdAt: new Date(),
            author: { _id: id, id, username, email, fullName, role, avatar }
          };

          return Post.findByIdAndUpdate(
            { _id: postId },
            { $push: { comments: newComment } }
          )
            .then(() => newComment)
            .catch(e => {
              throw e;
            });
        })
        .catch(e => {
          if (e) throw new GraphQLError(e.reason);
          throw new GraphQLError("Can't find user with such id.");
        });
    } else {
      throw new GraphQLError('Must be logged in.');
    }
  }
};
