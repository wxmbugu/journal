import pytz
from tzlocal import get_localzone


VERIFICATION_EXPIRY_TIME = 24 * 60 * 60  # 24 hour in seconds


SERVER_TIME_ZONE = pytz.timezone(str(get_localzone()))
