from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Favorite, Listing, User
from ..schemas import FavoriteCreate, FavoriteOut
from ..serializers import serialize_favorite

router = APIRouter(prefix="/favorites", tags=["favorites"])


def favorite_options():
    return (
        selectinload(Favorite.listing).selectinload(Listing.host),
        selectinload(Favorite.listing).selectinload(Listing.images),
        selectinload(Favorite.listing).selectinload(Listing.reviews),
    )


@router.get("/{user_id}", response_model=list[FavoriteOut])
def list_favorites(user_id: int, db: Session = Depends(get_db)) -> list[dict]:
    if not db.get(User, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    favorites = db.execute(
        select(Favorite)
        .where(Favorite.user_id == user_id)
        .options(*favorite_options())
        .order_by(Favorite.created_at.desc())
    ).scalars().unique().all()
    return [serialize_favorite(favorite) for favorite in favorites]


@router.post("", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def add_favorite(payload: FavoriteCreate, db: Session = Depends(get_db)) -> dict:
    if not db.get(User, payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if not db.get(Listing, payload.listing_id):
        raise HTTPException(status_code=404, detail="Listing not found")

    favorite = Favorite(user_id=payload.user_id, listing_id=payload.listing_id)
    db.add(favorite)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        favorite = db.scalar(
            select(Favorite).where(
                Favorite.user_id == payload.user_id,
                Favorite.listing_id == payload.listing_id,
            )
        )
        if not favorite:
            raise HTTPException(status_code=409, detail="Unable to save favorite")

    statement = select(Favorite).where(Favorite.id == favorite.id).options(*favorite_options())
    created = db.execute(statement).scalars().unique().one()
    return serialize_favorite(created)


@router.delete("/{user_id}/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(user_id: int, listing_id: int, db: Session = Depends(get_db)) -> Response:
    favorite = db.scalar(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.listing_id == listing_id)
    )
    if not favorite:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    db.delete(favorite)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
