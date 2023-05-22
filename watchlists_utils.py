from utils import logger




def create_watchlist(request, cursor, conn):
    watchlist_dict = request.get_json()
    

