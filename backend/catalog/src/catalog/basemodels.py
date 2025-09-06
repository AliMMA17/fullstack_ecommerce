from __future__ import annotations
from pydantic import BaseModel, ConfigDict, condecimal
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    draft = "draft"
    active = "active"
    archived = "archived"

# ---- create payloads ----
class ProductVariantCreate(BaseModel):
    sku: str
    title: str
    price: condecimal(max_digits=12, decimal_places=2, ge=0)
    compare_at: Optional[condecimal(max_digits=12, decimal_places=2, ge=0)] = None
    barcode: Optional[str] = None
    weight_grams: Optional[int] = None

class ProductCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    brand: Optional[str] = None
    status: Optional[ProductStatus] = None          # defaults to 'draft' in DB
    default_currency: Optional[str] = None          # defaults to 'USD' in DB
    variants: List[ProductVariantCreate] = []       # <-- nested variants

# ---- read payloads (you already had these) ----
class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    slug: str
    status: ProductStatus
    description: Optional[str] = None
    brand: Optional[str] = None
    default_currency: str
    created_at: datetime
    updated_at: datetime

class ProductVariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    product_id: UUID
    sku: str
    title: str
    barcode: Optional[str] = None
    weight_grams: Optional[int] = None
    price: condecimal(max_digits=12, decimal_places=2)
    compare_at: Optional[condecimal(max_digits=12, decimal_places=2)] = None

class ProductDetailRead(ProductRead):
    variants: List[ProductVariantRead] = []
