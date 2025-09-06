from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json
async def enqueue_event(session: AsyncSession, aggregate_type: str, aggregate_id: str, event_type: str, payload: dict):
    q = text("""
        INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload, occurred_at)
        VALUES (:t, :id, :e, :p::jsonb, NOW())
    """)
    await session.execute(q, {"t": aggregate_type, "id": str(aggregate_id), "e": event_type, "p": json.dumps(payload)})