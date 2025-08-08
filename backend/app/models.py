from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .db import Base


class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), index=True)  # symptom_check | misinformation_scan
    input_text = Column(Text, nullable=False)
    result_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


