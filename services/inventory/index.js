const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { readFileSync } = require('fs')
const gql = require('graphql-tag')
const Redis = require('ioredis')
const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost' })

const typeDefs = gql(readFileSync('./schema.graphql', 'utf8'))

const resolvers = {
  Query: {
    _dummy: () => 'hello'
  },
  Product: {
    inventory: async (product) => {
      const raw = await redis.call('JSON.GET', `inventory:${product.id}`)
      return raw ? JSON.parse(raw) : null
    }
  }
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
})

startStandaloneServer(server, {
  listen: { port: 4003, host: '0.0.0.0' }
}).then(({ url }) => {
  console.log(`🚀 inventory subgraph ready at ${url}`)
})
