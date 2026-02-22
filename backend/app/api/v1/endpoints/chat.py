from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.db.session import get_db
from app.schemas import schemas
from app.core.dependencies import get_current_user
from app.models.models import User, Conversation, ChatMessage

router = APIRouter()

@router.post("/keys", response_model=schemas.User)
def upload_public_key(
    key_in: schemas.KeyUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.public_key = key_in.public_key
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/keys/{username}")
def get_user_public_key(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"public_key": user.public_key}

@router.post("/messages", response_model=schemas.ChatMessage)
def send_message(
    message_in: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find recipient
    recipient = db.query(User).filter(User.username == message_in.recipient_username).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    from sqlalchemy import and_
    # Find or create conversation
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == recipient.id),
            and_(Conversation.user1_id == recipient.id, Conversation.user2_id == current_user.id)
        )
    ).first()
    
    if not conv:
        conv = Conversation(user1_id=current_user.id, user2_id=recipient.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    
    # Create message
    message = ChatMessage(
        conversation_id=conv.id,
        sender_id=current_user.id,
        encrypted_content=message_in.encrypted_content,
        iv=message_in.iv,
        recipient_key=message_in.recipient_key,
        sender_key=message_in.sender_key
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/conversations", response_model=List[schemas.Conversation])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversations = db.query(Conversation).filter(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
    ).all()
    return conversations

@router.get("/messages/{conversation_id}", response_model=List[schemas.ChatMessage])
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is part of the conversation
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conv.user1_id != current_user.id and conv.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")
    
    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).order_by(ChatMessage.created_at.asc()).all()
    return messages
