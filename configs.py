import os

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_PORT = os.getenv("DB_PORT")
SCHEMA = os.getenv("SCHEMA")
ENV = os.getenv("ENV")


avl_keys_count = int(os.getenv("avl_keys_count"))
pxy_keys_count = int(os.getenv("pxy_keys_count"))

api_keys = [os.getenv(f"avl_api_key_{i}") for i in range(1, avl_keys_count)]
proxy_api_keys = [os.getenv(f"pxy_api_key_{i}") for i in range(1, pxy_keys_count)]

api_base_url = "https://www.alphavantage.co/query"
proxy_base_url = "http://api.scrapestack.com/scrape"


