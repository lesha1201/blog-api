const express = require('express');
const jwt = require('express-jwt');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
require('dotenv').config();

const connectMongoose = require('../database/mongoose');
const schema = require('./schema');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Subscription = require('./resolvers/Subscription');
const User = require('../database/models/User');

const app = express();
app.use(cors());
connectMongoose();

// The root provides a resolver function for each API endpoint
const root = Object.assign({}, Query, Mutation, Subscription);

app.use(
  '/graphql',
  jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  })
);
app.use('/graphql', function(req, res, done) {
  if (req.user) {
    User.findById(req.user.id).then(user => {
      req.context = {
        user
      };
    });
  }
  done();
});
app.use(
  '/graphql',
  graphqlHTTP(req => ({
    schema: schema,
    context: req.context,
    rootValue: root,
    graphiql: process.env.NODE_ENV !== 'development'
  }))
);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
