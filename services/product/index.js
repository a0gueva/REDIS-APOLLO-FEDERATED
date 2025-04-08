const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { gql } = require('graphql-tag')
const Redis = require('ioredis')
const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost' })

const typeDefs = gql`
  type Product @key(fields: "id") {
    id: ID!
    name: String
    category: String
  }

  type Query {
    product(id: ID!): Product
  }
`

const resolvers = {
  Query: {
    product: async (_, { id }) => {
      const raw = await redis.call('JSON.GET', `product:${id}`)
      if (!raw) return null
    
      const base = JSON.parse(raw)
      return {
        id: base.id,           // ✅ explicitly returned
        name: base.name,
        category: base.category,
        __typename: 'Product'  // ✅ REQUIRED for federation stitching
      }
    }
  }
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
})

startStandaloneServer(server, {
  listen: { port: 4001 }
}).then(({ url }) => {
  console.log(`🚀 product subgraph ready at ${url}`)
})
