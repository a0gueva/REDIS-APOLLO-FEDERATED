## POC for Federated Apollo graphQL backed by a redis cache
  Services
1. Gateway
2. Product
3. Price
4. Inventory

Server and Redis Cache runs inside Docker container and are started up using **docker compose up -d**

Products Query
```
query GetProducts {
    products {
      id
      name
      price {
        amount
        currency
      }
      inventory {
        count
      }
    }
  }
```

Product Query **(variables - {"id": "1"})**

```
query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price {
        amount
      }
      inventory {
        count
      }
    }
  }
```
