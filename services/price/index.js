const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { gql } = require('graphql-tag')
const Redis = require('ioredis')
const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost' })

const typeDefs = gql`
  extend type Product @key(fields: "id") {
    id: ID! @external
    price: Price
  }

  type Price {
    amount: Float
    currency: String
  }

  type Query {
    _dummy: String
  }
`

const resolvers = {
  Product: {
    price: async (product) => {
      const raw = await redis.call('JSON.GET', `price:${product.id}`)
      return raw ? JSON.parse(raw) : null
    }
  },
  Query: {
    _dummy: () => 'hello'
  }
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
})

startStandaloneServer(server, {
  listen: { port: 4002 }
}).then(({ url }) => {
  console.log(`🚀 price subgraph ready at ${url}`)
})
