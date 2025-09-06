import base64, json
def encode_cursor(obj: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode()
def decode_cursor(cur: str) -> dict:
    return json.loads(base64.urlsafe_b64decode(cur.encode()).decode())