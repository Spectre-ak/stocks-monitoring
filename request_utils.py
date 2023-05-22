from urllib.parse import urlencode
import os
import requests
import random
import string
from utils import logger
from configs import api_base_url, proxy_base_url, api_keys, proxy_api_keys


def send_api_request(request, params):
  api_res={}
  fetched=False
  for api_key in api_keys:
    logger(request, f"API key in use {api_key}")
    params['apikey']=api_key
    req_url=f"{api_base_url}?{urlencode(params)}"
    r = requests.get(req_url)
    api_res = r.json()
    logger(request, f"Results fetched directly: {api_res}")
    if 'Error Message' in api_res or 'Note' in api_res:
      logger(request, f"Trying with the scrape(proxy) API")
      for proxy_api_key in proxy_api_keys:
        proxy_server_params = {
          'access_key': proxy_api_key,
          'url': req_url
        }
        r = requests.get(proxy_base_url, proxy_server_params)
        api_res = r.json()
        logger(request, f"Results fetched using proxy {proxy_api_key}: {api_res}")
        if 'success' in api_res and api_res['success'] is False:
          logger(request, f"Cannot fetch using proxy, trying different proxy api key")
          continue
        else:
          logger(request, f"Proxy returned response succesfully")
          if 'Error Message' in api_res or 'Note' in api_res:
            logger(request, f"Proxy returned response is not valid, trying with different stock api key")
          else:
            logger(request, f"Proxy returned response is valid, exiting loops")
            fetched=True
          break
      if fetched:
        break
    else:
      fetched=True
      break

  return api_res


