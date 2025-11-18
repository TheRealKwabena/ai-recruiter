# models.py

from sqlmodel import SQLModel, Field, Relationship, JSON, Column
# --- Add this import ---
from sqlalchemy import TEXT, Column as sa_Column
# --- End add ---

from datetime import datetime
from typing import Optional, List
from enum import Enum
from uuid import UUID, uuid4
from pydantic import BaseModel


# -----------------
# Enums
# -----------------
class Role(str, Enum):
    CANDIDATE = "CANDIDATE"
    ADMIN = "ADMIN"


# -----------------
# BASE Models
# -----------------

class UserBase(SQLModel):
    name: str
    username: str
    email: str = Field(unique=True, index=True)


class JobBase(SQLModel):
    title: str
    role: str
    description: str
    company: str
    location: str
    required_skills: List[str] = Field(sa_column=Column(JSON))
    required_certifications: List[str] = Field(sa_column=Column(JSON))


class ApplicationBase(SQLModel):
    """Fields a Candidate submits when Applying."""
    # --- FIX 1 ---
    cover_letter: str = Field(sa_column=sa_Column(TEXT))
    # --- End Fix ---
    skills: List[str] = Field(sa_column=Column(JSON))
    certifications: List[str] = Field(sa_column=Column(JSON))


# -----------------
# CREATE Models
# -----------------

class UserCreate(UserBase):
    password: str
    role: Role


class JobCreate(JobBase):
    pass


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    ai_reasoning: Optional[str] = None


# -----------------
# TABLE Models
# -----------------

class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    hashed_password: str
    role: Role = Field(default=Role.CANDIDATE)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    jobs: List["Job"] = Relationship(back_populates="owner")
    applications: List["Application"] = Relationship(back_populates="candidate")


class Job(JobBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: str = Field(foreign_key="user.id")

    owner: User = Relationship(back_populates="jobs")
    applications: List["Application"] = Relationship(back_populates="job")


class Application(ApplicationBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    job_id: str = Field(foreign_key="job.id")
    candidate_id: str = Field(foreign_key="user.id")

    # --- System-Set Fields ---
    status: str = Field(default="PENDING", index=True)
    resume_path: str

    # --- FIX 2 ---
    resume_text: str = Field(sa_column=sa_Column(TEXT))

    # --- FIX 3 ---
    ai_reasoning: Optional[str] = Field(default=None, sa_column=sa_Column(TEXT))
    # --- End Fixes ---

    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = Field(default=None)

    job: Job = Relationship(back_populates="applications")
    candidate: User = Relationship(back_populates="applications")


# -----------------
# PUBLIC & TOKEN Models
# -----------------

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserPublic(UserBase):
    id: str
    role: Role


class UsersPublic(BaseModel):
    data: List[UserPublic]


class JobPublic(JobBase):
    id: str
    created_at: datetime
    owner: UserPublic  # Nested owner data


class JobsPublic(BaseModel):
    data: List[JobPublic]


class ApplicationPublic(ApplicationBase):
    id: str
    status: str
    resume_path: str
    resume_text: str
    ai_reasoning: Optional[str]
    submitted_at: datetime
    reviewed_at: Optional[datetime]

    job: JobPublic
    candidate: UserPublic


class ApplicationsPublic(BaseModel):
    data: List[ApplicationPublic]


# In the Models section of main.py

class JobUpdate(SQLModel):
    title: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    # We repeat the columns here but make them Optional
    required_skills: Optional[List[str]] = None
    required_certifications: Optional[List[str]] = None