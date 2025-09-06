# src/auth/module.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from sqlalchemy.orm import selectinload
from src.models import User, Role, Session, user_roles
from .basemodels import RegisterIn, LoginIn, TokenOut, UserOut, hash_password, verify_password, create_access_token, create_refresh_token
import datetime as dt
from passlib.hash import bcrypt

async def register_user(session: AsyncSession, data: RegisterIn) -> TokenOut:
    exists = (await session.execute(select(User).where(User.email == data.email))).scalar_one_or_none()
    if exists:
        raise ValueError("Email already registered")

    user = User(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name)
    session.add(user)
    await session.flush()

    role = (await session.execute(select(Role).where(Role.code == "customer"))).scalar_one_or_none()
    if not role:
        role = Role(code="customer", name="Customer")
        session.add(role)
        await session.flush()

    # ⬇️ insert into association table instead of user.roles.append(role)
    await session.execute(
        insert(user_roles).values(user_id=user.id, role_id=role.id)
    )
    await session.commit()

    access = create_access_token(str(user.id), ["customer"])
    refresh = create_refresh_token(str(user.id))
    s = Session(
        user_id=user.id,
        refresh_token_hash=bcrypt.hash(refresh),
        user_agent=None,
        ip=None,
        expires_at=dt.datetime.utcnow() + dt.timedelta(days=30),
    )
    session.add(s)
    await session.commit()

    return TokenOut(access_token=access, refresh_token=refresh, user=UserOut.model_validate(user))

async def login_user(session: AsyncSession, data: LoginIn) -> TokenOut:
    # ⬇️ eager-load roles to avoid lazy I/O
    user = (
        await session.execute(
            select(User)
            .where(User.email == data.email)
            .options(selectinload(User.roles))
        )
    ).scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise ValueError("Invalid credentials")

    access = create_access_token(str(user.id), [r.code for r in user.roles])
    refresh = create_refresh_token(str(user.id))
    s = Session(
        user_id=user.id,
        refresh_token_hash=bcrypt.hash(refresh),
        user_agent=None,
        ip=None,
        expires_at=dt.datetime.utcnow() + dt.timedelta(days=30),
    )
    session.add(s)
    await session.commit()

    return TokenOut(access_token=access, refresh_token=refresh, user=UserOut.model_validate(user))
