const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'product', url: 'http://product:4001' },
    { name: 'price', url: 'http://price:4002' },
    { name: 'inventory', url: 'http://inventory:4003' }
  ],
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (!context._timers) context._timers = {}
        context._timers[name] = process.hrtime()
      },
      didReceiveResponse({ response, context }) {
        if (context._timers && context._timers[name]) {
          const [sec, nanosec] = process.hrtime(context._timers[name])
          const durationMs = (sec * 1e3 + nanosec / 1e6).toFixed(2)
          console.log(`[⏱] ${name} responded in ${durationMs}ms`)
        }
        return response
      }
    });
  }
});

const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 }
}).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
