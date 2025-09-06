# media_storage/main.py
import os
import re
import imghdr
import asyncio
from uuid import uuid4
from typing import List, Optional
from pathlib import Path
from typing import Dict

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from starlette import status

# === MEDIA PATH: in the same directory as this file by default ===
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MEDIA_ROOT = BASE_DIR / "media"
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", str(DEFAULT_MEDIA_ROOT))).resolve()
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB

# Filename prefix like 000001-, 000002-, ... (keeps order stable by lexicographic sort)
POSITION_PAD = 6
FNAME_RE = re.compile(rf"^(\d{{{POSITION_PAD}}})-")

# In-process locks to avoid race conditions (one per owner bucket)
_locks: dict[str, asyncio.Lock] = {}


def _get_lock(key: str) -> asyncio.Lock:
    lock = _locks.get(key)
    if not lock:
        lock = asyncio.Lock()
        _locks[key] = lock
    return lock


app = FastAPI(title="media_storage")
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def ext_from_bytes(filename: str, content: bytes) -> str:
    """
    Determine extension from content; fallback to filename.
    """
    kind = imghdr.what(None, h=content)  # 'jpeg','png','gif', None for webp
    if kind == "jpeg":
        return "jpg"
    if kind in {"png", "gif"}:
        return kind
    # imghdr doesn’t detect webp reliably → fallback to filename
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext == "jpeg":
        ext = "jpg"
    return ext if ext in {"jpg", "png", "gif", "webp"} else "bin"


async def save_images(
    subdir: str,
    owner_id: str,
    files: List[UploadFile],
    alts: Optional[List[str]],
):
    """
    Save images with ascending numeric prefixes per owner bucket (product/user).
    Returns a list of dicts containing url, filename, alt, and position.
    """
    if not files:
        raise HTTPException(400, "No files provided")

    base_dir = MEDIA_ROOT / subdir / owner_id
    ensure_dir(base_dir)

    # Lock per owner (product_id or user_id) so two concurrent uploads don't share the same number
    async with _get_lock(f"{subdir}:{owner_id}"):
        # Find current max numeric prefix in the folder
        max_pos = -1
        if base_dir.exists():
            for p in base_dir.iterdir():
                if p.is_file():
                    m = FNAME_RE.match(p.name)
                    if m:
                        try:
                            max_pos = max(max_pos, int(m.group(1)))
                        except ValueError:
                            pass

        next_pos = max_pos + 1  # next number to assign

        saved = []
        try:
            for idx, up in enumerate(files):
                if up.content_type not in ALLOWED_MIME:
                    raise HTTPException(400, f"Unsupported content type: {up.content_type}")

                content = await up.read()
                if len(content) > MAX_BYTES:
                    raise HTTPException(413, f"File too large: {up.filename}")

                ext = ext_from_bytes(up.filename, content)
                if ext not in {"jpg", "png", "gif", "webp"}:
                    raise HTTPException(400, f"Unsupported extension for: {up.filename}")

                prefix = str(next_pos).zfill(POSITION_PAD)  # "000001"
                next_pos += 1

                fname = f"{prefix}-{uuid4()}.{ext}"
                abs_path = base_dir / fname

                # Write atomically
                tmp = abs_path.with_suffix(abs_path.suffix + ".tmp")
                with open(tmp, "wb") as f:
                    f.write(content)
                os.replace(tmp, abs_path)

                rel = Path(subdir) / owner_id / fname               # e.g. products/<product_id>/000001-<uuid>.jpg
                url = f"/media/{rel.as_posix()}"                    # public path for browser
                position = int(prefix)

                saved.append({
                    "url": url,
                    "alt": (alts[idx] if alts and idx < len(alts) else None),
                    "filename": fname,
                    "position": position,
                })

        except Exception:
            # best-effort cleanup of any stray .tmp files
            for p in base_dir.glob("*.tmp"):
                try:
                    p.unlink()
                except OSError:
                    pass
            raise

    return saved


@app.post("/upload/products/{product_id}", status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    product_id: str,
    files: List[UploadFile] = File(..., description="Repeat this key for multiple files"),
    alts: Optional[List[str]] = Form(None, description="Optional alt text, one per file"),
):
    items = await save_images("products", product_id, files, alts)
    return {"count": len(items), "items": items}


@app.post("/upload/profiles/{user_id}", status_code=status.HTTP_201_CREATED)
async def upload_profile_photo(
    user_id: str,
    file: UploadFile = File(...),
):
    items = await save_images("profiles", user_id, [file], alts=None)
    # For profiles you could keep only latest by deleting older files here if you want.
    return {"url": items[0]["url"]}


def path_from_media_url(url: str) -> Path:
    """
    Convert /media/... URL back to filesystem path under MEDIA_ROOT.
    """
    if not url.startswith("/media/"):
        raise HTTPException(400, "Invalid media URL")
    rel = url.removeprefix("/media/")  # e.g. products/<id>/<file>.jpg
    return MEDIA_ROOT / Path(rel)


@app.delete("/files", status_code=200)
async def delete_file(url: str = Query(..., description="Media URL previously returned by this service")):
    path = path_from_media_url(url)
    try:
        path.unlink()
    except FileNotFoundError:
        # idempotent delete
        pass
    return {"ok": True}


@app.get("/products/{product_id}/images")
async def list_product_images(product_id: str) -> Dict[str, object]:
    """
    List images under media/products/<product_id>/..., sorted by numeric prefix.
    Returns: { count, items: [{url, alt, filename, position}] }
    """
    base_dir = MEDIA_ROOT / "products" / product_id
    if not base_dir.exists():
        return {"count": 0, "items": []}

    items = []
    for p in sorted(base_dir.iterdir()):
        if p.is_file():
            m = FNAME_RE.match(p.name)
            try:
                pos = int(m.group(1)) if m else 0
            except Exception:
                pos = 0
            rel = Path("products") / product_id / p.name
            url = f"/media/{rel.as_posix()}"
            items.append({
                "url": url,
                "alt": None,            # (no metadata store yet)
                "filename": p.name,
                "position": pos,
            })

    items.sort(key=lambda x: x["position"])
    return {"count": len(items), "items": items}