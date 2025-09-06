import logging, json, os
class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {"level": record.levelname, "msg": record.getMessage(), "logger": record.name}
        return json.dumps(base)
def setup_logging():
    h = logging.StreamHandler()
    h.setFormatter(JsonFormatter())
    logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"), handlers=[h])