const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloGateway } = require('@apollo/gateway');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'product', url: 'http://product:4001' },
    { name: 'price', url: 'http://price:4002' },
    { name: 'inventory', url: 'http://inventory:4003' }
  ]
});

const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 }
}).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
