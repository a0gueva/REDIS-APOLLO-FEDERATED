const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { gql } = require('graphql-tag')
const Redis = require('ioredis')
const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost' })

const typeDefs = gql`
  extend type Product @key(fields: "id") {
    id: ID! @external
    inventory: Inventory
  }

  type Inventory {
    count: Int
    warehouse: String
  }

  type Query {
    _dummy: String
  }
`

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
  listen: { port: 4003 }
}).then(({ url }) => {
  console.log(`🚀 inventory subgraph ready at ${url}`)
})
