from utils import logger
from configs import SCHEMA
import json
import sys
import uuid

def user_watchlist_update(connection, cursor, watchlist_id, watchlist, username):
    cursor.execute("""
        UPDATE {}.user_watch_list
            SET watchlist = jsonb_set(
                cast(watchlist as jsonb), %s, %s, true
            )
        WHERE
            username = %s
    """.format(SCHEMA), (watchlist_id, watchlist, username))
    connection.commit()

def create_watchlist_checks(watchlist):
    check_res = {
        "status": False,
        "msg": ""
    }
    checks_failed = False
    if sys.getsizeof(watchlist) > 5000:
        check_res["msg"] = "Watchlist is too large"
        checks_failed = True
    if "wathclistName" not in watchlist.keys():
        check_res["msg"] = f'{check_res["msg"]},Watchlist name is not present!'
        checks_failed = True
    if "selectedSymbols" not in watchlist.keys():
        check_res["msg"] = f'{check_res["msg"]},Symbols are not present!'
        checks_failed = True
    if "selectedSymbols" in watchlist.keys() and len(watchlist["selectedSymbols"]) > 30:
        check_res["msg"] = f'{check_res["msg"]},Cannot accept more than 30 symbols!'
        checks_failed = True
    if checks_failed is False:
        check_res["status"] = True
    return check_res


def create_watchlist(request, cursor, conn):
    watchlist_create_res = {
        "status": False,
        "msg": ""
    }
    try:
        watchlist_dict = request.get_json()
        check_res = create_watchlist_checks(watchlist_dict)
        if check_res["status"] is False:
            return check_res 
        watchlist_id = str(uuid.uuid4())
        user_watchlist_update(conn, cursor, f"{{{watchlist_id}}}", json.dumps({"name": watchlist_dict["wathclistName"], "symbols": watchlist_dict["selectedSymbols"]}), watchlist_dict["username"])
        watchlist_create_res["status"] = True
        watchlist_create_res["msg"] = "Watchlist added!"
        watchlist_create_res["watchlist_id"] = watchlist_id
    except Exception as e:
        logger(request, f"Watchlist create error: {e}")
        watchlist_create_res["msg"] = "Something went wront, unable to create watchlist!"
    return watchlist_create_res



