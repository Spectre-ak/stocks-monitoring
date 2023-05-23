# Stocks Monitoring App

Try it out: https://stocks-monitoring.onrender.com/

React frontend: [/app-ui](https://github.com/Spectre-ak/stocks-monitoring/tree/main/app-ui)

Flask backend: [./](https://github.com/Spectre-ak/stocks-monitoring/)

Postgres DB schema:  [db_schema.sql](https://github.com/Spectre-ak/stocks-monitoring/blob/main/db_schema.sql)
API routes:


Utilities, requires Authorization token in headers
| Route  |  Type | Function |
| ------------- | ------------- | ------------- | 
| /v1/stocks/<stock_name> | GET | Get stock details, using alphavantage's [latestprice](https://www.alphavantage.co/documentation/#latestprice)  |
| /v1/stocks/search/keywords> | GET | Get stock symbols, using alphavantage's using [symbolsearch](https://www.alphavantage.co/documentation/#symbolsearch)  |
| /v1/watchlist/create | POST | Create watchlist  |
| /v1/watchlist/update  | POST | Update user's watchlist  |
  
Auth routes

| Route  |  Type | Function |
| ------------- | ------------- | ------------- | 
| /v1/auth/validate/token | GET | Validate token  |
| /v1/auth/login | POST | User signin |
| /v1/auth/signup | POST | User signup |


### App [configs](https://github.com/Spectre-ak/stocks-monitoring/blob/main/configs.py) for local

DB configs, ENV can be LOCAL, UAT
```
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_PORT = os.getenv("DB_PORT")
SCHEMA = os.getenv("SCHEMA")
ENV = os.getenv("ENV")
```
Get alpha vantage api key from [here](https://www.alphavantage.co/support/#api-key), and store it in envs like this
```
avl_api_key_1 = <api_key>
avl_api_key_2 = <api_key> # if you have multiple keys
```
Proxy api keys, since alphavantage has limits(5 calls/min, 500/day) on requests made, use proxy to overcome it with multiple keys. Get proxy key from [scrapestack.com](scrapestack.com), and store api keys like this

```
pxy_api_key_1 = <proxy_api_key>
```
And finally store, the no of your alphavantage, scrapestack keys in `avl_keys_count`, `pxy_keys_count`.

