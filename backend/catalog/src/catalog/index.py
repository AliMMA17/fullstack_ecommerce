from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from lib.db.postgres import get_session
from src.models import Product, ProductVariant                      # <-- import Variant too
from src.catalog.basemodels import (
    ProductCreate, ProductRead, ProductDetailRead
)

router = APIRouter()

@router.get("/products", response_model=list[ProductRead])
async def list_products(
    q: str | None = None,
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Product).limit(limit)
    if q:
        stmt = stmt.where(Product.title.ilike(f"%{q}%"))
    res = await session.execute(stmt)
    return res.scalars().unique().all()

@router.get("/products/{product_id}", response_model=ProductDetailRead)
async def get_product(product_id: UUID, session: AsyncSession = Depends(get_session)):
    stmt = (
        select(Product)
        .options(selectinload(Product.variants))
        .where(Product.id == product_id)
    )
    res = await session.execute(stmt)
    p = res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@router.post("/products", status_code=status.HTTP_201_CREATED, response_model=ProductDetailRead)
async def create_product(payload: ProductCreate, session: AsyncSession = Depends(get_session)):
    try:
        # create product (exclude nested variants from the product ctor)
        p = Product(**payload.model_dump(exclude_unset=True, exclude={"variants"}))
        session.add(p)
        await session.flush()  # <-- get p.id without committing

        # create variants (if any) tied to this product
        for v in payload.variants:
            session.add(ProductVariant(product_id=p.id, **v.model_dump(exclude_unset=True)))

        await session.commit()

        # reload with variants for response
        res = await session.execute(
            select(Product).options(selectinload(Product.variants)).where(Product.id == p.id)
        )
        return res.scalar_one()

    except IntegrityError as e:
        await session.rollback()
        # likely duplicate slug or sku
        raise HTTPException(status_code=409, detail="Duplicate slug or sku") from e
