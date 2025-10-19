"""
User Service for ChatBotPlatform

Handles user management operations with role-based access control.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User
from ..auth.password import hash_password
from ..schemas import UserCreate, UserUpdate
import logging

logger = logging.getLogger(__name__)

class UserService:
    """Service for user management operations"""

    @staticmethod
    async def create_user(
        user_data: UserCreate,
        created_by: Optional[User] = None,
        db: AsyncSession = None
    ) -> User:
        """Create a new user"""
        try:
            # Check permissions if created_by is provided
            if created_by:
                if not created_by.can_manage_user(User(role=user_data.role)):
                    raise PermissionError("Insufficient permissions to create user")

            # Hash password
            hashed_password = hash_password(user_data.password)

            # Create user
            user = User(
                email=user_data.email,
                password_hash=hashed_password,
                role=user_data.role,
                parent_id=created_by.id if created_by else None
            )

            db.add(user)
            await db.commit()
            await db.refresh(user)

            logger.info(f"User {user.email} created by {created_by.email if created_by else 'system'}")
            return user

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating user: {e}")
            raise

    @staticmethod
    async def get_user_by_id(user_id: int, db: AsyncSession) -> Optional[User]:
        """Get user by ID"""
        return await User.get_by_id(db, user_id)

    @staticmethod
    async def get_user_by_email(email: str, db: AsyncSession) -> Optional[User]:
        """Get user by email"""
        return await User.get_by_email(db, email)

    @staticmethod
    async def get_users_by_role(
        role: str,
        parent_id: Optional[int] = None,
        db: AsyncSession = None
    ) -> List[User]:
        """Get users by role"""
        return await User.get_users_by_role(db, role, parent_id)

    @staticmethod
    async def update_user(
        user: User,
        update_data: UserUpdate,
        updated_by: User,
        db: AsyncSession
    ) -> User:
        """Update user information"""
        try:
            # Check permissions
            if not updated_by.can_manage_user(user):
                raise PermissionError("Insufficient permissions to update user")

            # Update fields
            update_dict = update_data.dict(exclude_unset=True)

            for field, value in update_dict.items():
                if field == "password":
                    # Hash new password
                    setattr(user, "password_hash", hash_password(value))
                else:
                    setattr(user, field, value)

            db.add(user)
            await db.commit()
            await db.refresh(user)

            logger.info(f"User {user.email} updated by {updated_by.email}")
            return user

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating user: {e}")
            raise

    @staticmethod
    async def delete_user(
        user: User,
        deleted_by: User,
        db: AsyncSession
    ) -> bool:
        """Delete a user"""
        try:
            # Check permissions
            if not deleted_by.can_manage_user(user):
                raise PermissionError("Insufficient permissions to delete user")

            # Check if user has children
            children = await User.get_users_by_role(db, None, user.id)
            if children:
                raise ValueError("Cannot delete user with subordinates")

            # Soft delete by deactivating
            user.is_active = False
            db.add(user)
            await db.commit()

            logger.info(f"User {user.email} deactivated by {deleted_by.email}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting user: {e}")
            raise

    @staticmethod
    async def list_users(
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = None
    ) -> List[User]:
        """List users based on current user's permissions"""
        try:
            query = select(User)

            # Filter based on role
            if current_user.role == "manager":
                # Managers can see their subordinates and users
                query = query.where(
                    (User.parent_id == current_user.id) |
                    ((User.role == "user") & (User.parent_id.is_(None)))
                )
            elif current_user.role == "user":
                # Users can only see themselves
                query = query.where(User.id == current_user.id)

            # Apply pagination
            query = query.offset(skip).limit(limit)

            result = await db.execute(query)
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error listing users: {e}")
            raise