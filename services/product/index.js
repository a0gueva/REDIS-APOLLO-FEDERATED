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
    product: async (_, { id }) => {
      const raw = await redis.call('JSON.GET', `product:${id}`)
      if (!raw) return null

      const base = JSON.parse(raw)
      return {
        id: base.id,
        name: base.name,
        category: base.category,
        __typename: 'Product'
      }
    },
    products: async () => {
      const keys = await redis.keys('product:*')
      const pipeline = redis.pipeline()
      keys.forEach((key) => pipeline.call('JSON.GET', key))
      const results = await pipeline.exec()
    
      return results.map(([_, raw]) => {
        const product = JSON.parse(raw)
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          __typename: 'Product'
        }
      })
    }
  }
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }])
})

startStandaloneServer(server, {
  listen: { port: 4001, host: '0.0.0.0' }
}).then(({ url }) => {
  console.log(`🚀 product subgraph ready at ${url}`)
})
