// MongoDB configurations
module.exports = {
   development: {
      dbLink: 'mongodb://127.0.0.1/graphql',
      app: {
         name: 'graphql'
      }
   },
   production: {
      dbLink: 'unknown',
      app: {
         name: 'graphql'
      }
   }
};
