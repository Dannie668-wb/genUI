from app.agent.tools.request_location import request_location
from app.agent.tools.search_shops import search_nearby_shops
from app.agent.tools.get_menu import get_menu
from app.agent.tools.create_order import create_order
from app.agent.tools.call_payment import call_payment

ALL_TOOLS = [request_location, search_nearby_shops, get_menu, create_order, call_payment]
