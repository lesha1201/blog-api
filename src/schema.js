const { buildSchema } = require('graphql');

const schema = buildSchema(`
   type Query {
      feed(filter: FilterInput, skip: Int, limit: Int): Feed!
      verifyJWT(token: String!): User!
      getPost(id: String!): Article!
      getCategories: [SelectOption!]
   }

   type Mutation {
      signup(
         username: String!, email: String!, 
         password: String!, fullName: String!, 
         avatar: String
      ): AuthPayload
      signin(username: String!, password: String!): AuthPayload
      createPost(input: ArticleInput!): Article!
      updatePost(id: ID!, input: ArticleInput!): Article!
      deletePost(id: ID!): Article
      addCommentToPost(postId: ID!, commentText: String!): Comment!
   }

   input ArticleInput {
      img: String!
      title: String!
      text: String!
      categories: [SelectOptionInput!]
   }

   input FilterInput {
      title: String
      categories: [SelectOptionInput!]
      sortby: String
   }

   input SelectOptionInput {
      value: String!
      label: String!
      bgColor: String!
      textColor: String!
   }

   type Feed {
      articles: [Article!]!
      count: Int!
   }

   type Article {
      id: ID!
      img: String!
      title: String!
      text: String!
      author: User!
      categories: [SelectOption!]
      createdAt: String!
      comments: [Comment]
   }

   type Comment {
      author: User!
      text: String!
      createdAt: String!
   }

   type User {
      id: ID!
      username: String!
      email: String!
      fullName: String!
      role: String!
      avatar: String!
   }

   type SelectOption {
      value: String!
      label: String!
      bgColor: String!
      textColor: String!
   }

   type AuthPayload {
      token: String
      user: User
   }
`);

module.exports = schema;
