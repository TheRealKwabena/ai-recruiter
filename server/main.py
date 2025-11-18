import os
import json
import uuid
import smtplib
from email.message import EmailMessage
from datetime import timedelta
from typing import Optional, List
from typing_extensions import Annotated
from dotenv import load_dotenv
import jwt
from fastapi import (
    FastAPI, APIRouter, Depends, HTTPException, status,
    BackgroundTasks, UploadFile, File, Form, Query
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jwt.exceptions import InvalidTokenError
from sqlmodel import Session, select

# --- Local Imports ---
from db import get_session, create_db_and_tables, engine
from models import *  # Assuming models.py is in the same directory
from security import (
    get_password_hash, verify_password, create_access_token,
)
from ai_processing import *


# --- App Setup ---
load_dotenv()

#Secret key in .env files to encapsulate our private secrets and variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
DATABASE_URL = os.getenv("DATABASE_URL")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USERNAME)
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

def on_startup():
    """Function to run on app startup."""
    create_db_and_tables()


# FIX: Pass the function, don't call it. Use a list.
app = FastAPI(on_startup=[on_startup])

origins = ["*", "https://stroke-diagnoser-jrud.vercel.app/"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency Types ---
SessionDep = Annotated[Session, Depends(get_session)]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def send_email(recipient: str, subject: str, body: str):
    """Send an email using SMTP configuration."""
    if not SMTP_HOST or not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP not configured. Skipping email send.")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM or SMTP_USERNAME
    message["To"] = recipient
    message.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
    except Exception as exc:
        print(f"Failed to send email to {recipient}: {exc}")


def build_status_email(application: Application, status: str):
    job_title = application.job.title
    company_name = application.job.company
    candidate_name = application.candidate.name
    candidate_phone = getattr(application.candidate, "phone", None) or "the phone number on your profile"

    if status == "REJECTED":
        subject = f"Update on your application for {job_title} at {company_name}"
        body = (
            f"Dear {candidate_name},\n\n"
            f"Thank you for giving us the opportunity to review your application for the {job_title} position.\n\n"
            "We appreciate the time you took to apply and share your credentials. After a careful review of your "
            "skills and experience against our current requirements, we have decided not to move forward with your "
            "application at this time.\n\n"
            "We received a high volume of applications for this role. We will keep your resume in our database and "
            "contact you if a future opening matches your specific skill set.\n\n"
            "We wish you the best of luck in your job search.\n\n"
            f"Sincerely,\n\nThe Recruitment Team at {company_name}"
        )
        return subject, body
    if status == "ACCEPTED":
        subject = f"Good News! You've moved to the next stage for {job_title}"
        body = (
            f"Hi {candidate_name},\n\n"
            f"Great news! We have reviewed your application for the {job_title} position, and we are impressed with your experience.\n\n"
            "We would like to move you to the next stage of our hiring process.\n\n"
            "What happens next? A member of our team will review your profile personally and reach out within the next "
            "2-3 business days to schedule a brief phone interview or site visit.\n\n"
            f"In the meantime, please ensure your phone number {candidate_phone} is up to date.\n\n"
            f"Thank you for your interest in {company_name}. We look forward to speaking with you soon.\n\n"
            "Best regards,\n\nThe Recruitment Team"
        )
        return subject, body
    return None


# -----------------------------------------------------------------
#  Authentication & Dependencies
# -----------------------------------------------------------------

def get_user(session: SessionDep, username: str) -> Optional[User]:
    """Helper to get a user by username."""
    return session.exec(select(User).where(User.username == username)).first()


def authenticate_user(session: SessionDep, username: str, password: str):
    """Authenticates a user. Returns User object or None."""
    user = get_user(session, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(token: TokenDep, session: SessionDep) -> User:
    """Dependency to get the current user from a token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception

    user = get_user(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# FIX: Removed redundant get_current_active_user
CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_admin(current_user: CurrentUser) -> User:
    """Dependency that checks if the current user is an ADMIN."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted for your role."
        )
    return current_user


CurrentAdmin = Annotated[User, Depends(get_current_admin)]


# -----------------------------------------------------------------
#  Auth Endpoints (on main app)
# -----------------------------------------------------------------

@app.post("/token", tags=["Authentication"])
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        session: SessionDep
) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


# -----------------------------------------------------------------
#  User Endpoints
# -----------------------------------------------------------------
user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.post("/register", response_model=UserPublic)
def register_user(user: UserCreate, session: SessionDep) -> UserPublic:
    """Creates a new user (Admin or Candidate)."""

    # FIX: Check for existing user
    db_user = get_user(session, user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # FIX: Check for existing email
    db_user_email = session.exec(select(User).where(User.email == user.email)).first()
    if db_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    try:
        # FIX: Use the secure password hashing function
        hashed_password = get_password_hash(user.password)

        db_user = User.model_validate(user, update={
            "hashed_password": hashed_password
        })

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    except Exception as e:
        session.rollback()
        print("Error creating user:", e)
        raise HTTPException(status_code=500, detail=f"Error creating user: {e}")


@user_router.get("/me", response_model=UserPublic)
async def read_users_me(current_user: CurrentUser):
    """Gets the profile of the currently logged-in user."""
    return current_user


@user_router.get("/", response_model=List[UserPublic])
def read_all_users(
        session: SessionDep,
        admin: CurrentAdmin,  # FIX: Protect this endpoint
        offset: int = 0,
        limit: Annotated[int, Query(le=100)] = 100,
) -> List[UserPublic]:
    """(Admin Only) Gets a list of all users."""
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@user_router.get("/{user_id}", response_model=UserPublic)
def read_single_user(user_id: str, session: SessionDep, admin: CurrentAdmin) -> UserPublic:
    """(Admin Only) Gets a single user by ID."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@user_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
        user_id: str,
        session: SessionDep,
        current_admin: CurrentAdmin  # Security: Only Admins can delete users
):
    """(Admin Only) Deletes a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return None  # 204 No Content response

# -----------------------------------------------------------------
#  Job Endpoints
# -----------------------------------------------------------------
job_router = APIRouter(prefix="/jobs", tags=["Jobs"])


@job_router.post("/", response_model=JobPublic)  # FIX: Path was "/jobs"
async def create_job(
        job_create: JobCreate,
        session: SessionDep,
        current_admin: CurrentAdmin  # FIX: Use dependency for auth
):
    """(Admin Only) Creates a new job posting."""
    db_job = Job.model_validate(job_create, update={
        "owner_id": current_admin.id
    })
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job


@job_router.get("/", response_model=JobsPublic)
def get_all_jobs(session: SessionDep):
    """(Public) Gets a list of all available job postings."""
    jobs = session.exec(select(Job)).all()
    return JobsPublic(data=jobs)


@job_router.get("/{job_id}", response_model=JobPublic)
def get_single_job(job_id: str, session: SessionDep):
    """(Public) Gets the full details for a single job posting."""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# In the Job Router section of main.py

@job_router.put("/{job_id}", response_model=JobPublic)
def update_job(
        job_id: str,
        job_update: JobUpdate,
        session: SessionDep,
        current_admin: CurrentAdmin
):
    """(Admin Only) Updates an existing job posting."""

    # 1. Get the job from the DB
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Optional: Check if the Admin owns this job
    # if job.owner_id != current_admin.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to update this job")

    # 3. Convert the update data to a dict, excluding fields that weren't sent
    job_data = job_update.model_dump(exclude_unset=True)

    # 4. Update the job object
    for key, value in job_data.items():
        setattr(job, key, value)

    # 5. Save to DB
    session.add(job)
    session.commit()
    session.refresh(job)

    return job

@job_router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
        job_id: str,
        session: SessionDep,
        current_admin: CurrentAdmin
):
    """(Admin Only) Deletes a job posting."""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    session.delete(job)
    session.commit()
    return None
# -----------------------------------------------------------------
#  Application Endpoints
# -----------------------------------------------------------------
app_router = APIRouter(prefix="/applications", tags=["Applications"])


@app_router.post("/apply/{job_id}", response_model=ApplicationPublic)
async def submit_application(
        job_id: str,
        background_tasks: BackgroundTasks,
        current_user: CurrentUser,
        session: SessionDep,
        # --- Form Data ---
        cover_letter: str = Form(...),
        skills: List[str] = Form(...),  # '["skill1", "skill2"]'
        certifications: List[str] = Form(...),  # '["cert1"]"
        # --- File Upload ---
        resume_file: UploadFile = File(...)
):
    """(Candidate Only) Submits a new application for a specific job."""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # FIX: Secure file handling with unique names
    uploads_dir = "./uploads/resumes"
    os.makedirs(uploads_dir, exist_ok=True)
    file_extension = os.path.splitext(resume_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    resume_path = os.path.join(uploads_dir, unique_filename)

    try:
        with open(resume_path, "wb") as f:
            f.write(await resume_file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # --- Create Application ---
    try:
        db_app = Application(
            job_id=job_id,
            candidate_id=current_user.id,
            cover_letter=cover_letter,
            skills=skills,
            certifications=certifications,
            resume_path=resume_path,
            status="PENDING",
            resume_text=""  # Will be filled by background task
        )

        session.add(db_app)
        session.commit()
        session.refresh(db_app)

        # --- Add the slow AI task to the background ---
        background_tasks.add_task(run_ai_screening, db_app.id, db_app.job_id)

        return db_app
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for skills or certifications.")
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating application: {e}")


@app_router.get("/", response_model=ApplicationsPublic)
def get_all_applications(session: SessionDep, admin: CurrentAdmin):
    """(Admin Only) Gets a list of all applications."""
    apps = session.exec(select(Application)).all()
    return ApplicationsPublic(data=apps)


@app_router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
        application_id: str,
        session: SessionDep,
        current_admin: CurrentAdmin
):
    """(Admin Only) Deletes a specific application."""
    db_app = session.get(Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")

    session.delete(db_app)
    session.commit()
    return None
@app_router.get("/me", response_model=ApplicationsPublic)
def get_my_applications(session: SessionDep, current_user: CurrentUser):
    """(Candidate Only) Gets a list of their own applications."""
    apps = session.exec(
        select(Application).where(Application.candidate_id == current_user.id)
    ).all()
    return ApplicationsPublic(data=apps)


@app_router.patch("/{application_id}", response_model=ApplicationPublic)
def update_application_status(
        application_id: str,
        application_update: ApplicationUpdate,
        session: SessionDep,
        admin: CurrentAdmin,
        background_tasks: BackgroundTasks
):
    """(Admin Only) Updates an application - currently status updates."""
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = application_update.model_dump(exclude_unset=True)
    if not update_data:
        return application

    for field, value in update_data.items():
        setattr(application, field, value)

    session.add(application)
    session.commit()
    session.refresh(application)
    session.refresh(application, attribute_names=["job", "candidate"])

    new_status = update_data.get("status")
    if new_status:
        email_content = build_status_email(application, new_status)
        if email_content:
            subject, body = email_content
            background_tasks.add_task(
                send_email,
                application.candidate.email,
                subject,
                body
            )

    return application


# --- Add all routers to the main app ---
app.include_router(user_router)
app.include_router(job_router)
app.include_router(app_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)