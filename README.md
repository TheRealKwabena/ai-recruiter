# AI-Powered Job Recruitment Platform

A modern full-stack web application for intelligent job recruitment and candidate management, featuring AI-powered resume screening, automated email notifications, and a beautiful responsive UI.

## Features

### 🎯 Core Functionality

#### Authentication & User Management
- **Role-based access control**: Separate interfaces for Admins and Candidates
- **Secure authentication**: JWT-based token authentication with FastAPI
- **User registration**: Support for both Admin and Candidate roles
- **Profile management**: User profiles with role-specific features

#### Job Management (Admin)
- **Post jobs**: Create job listings with detailed requirements
- **View active jobs**: Browse and manage all active job postings
- **Archive jobs**: Archive completed or inactive positions
- **Job details**: Full job information including required skills and certifications

#### Application Management
- **Resume upload**: Candidates can upload resumes (PDF, DOC, etc.)
- **AI-powered screening**: Automatic resume analysis and candidate matching
- **Status tracking**: Track applications through PENDING → ACCEPTED/SHORTLISTED → HIRED/REJECTED
- **Admin actions**: Accept or reject applications with one click
- **Automated emails**: Automatic email notifications when application status changes
  - **Rejection emails**: Professional rejection notifications
  - **Acceptance emails**: Next-stage notifications for accepted candidates

#### Candidate Experience
- **Browse jobs**: Search and filter available positions
- **Apply easily**: Simple application form with resume upload
- **Track applications**: View all submitted applications with status updates
- **View resume**: Download submitted resumes

#### Dashboard & Analytics
- **Statistics overview**: Total jobs, applications, hired candidates
- **Application timeline**: Visual timeline of all applications
- **Status filters**: Filter applications by status (Pending, Accepted, Hired, Rejected)

### 🎨 UI/UX Features

- **Modern design**: Beautiful green-themed interface inspired by modern hiring platforms
- **Responsive layout**: Fully responsive design for desktop, tablet, and mobile
- **shadcn-style components**: Reusable UI components (Button, Card, Badge, Input, Textarea)
- **Glassmorphism effects**: Modern glass-panel design with backdrop blur
- **Smooth animations**: Transitions and hover effects throughout
- **Open Sans font**: Clean, professional typography

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM (built on SQLAlchemy)
- **SQLite** - Lightweight database (can be switched to PostgreSQL)
- **JWT (PyJWT)** - JSON Web Token authentication
- **Passlib** - Password hashing (bcrypt)
- **Python-multipart** - File upload support
- **SMTP** - Email sending capabilities
- **AI Processing** - Resume text extraction and candidate matching

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/TheRealKwabena/ai-recruiter.git
cd discrete_project/ai-recruiter
```

2. **Set up the backend:**

```bash
cd server

# Create a virtual environment (recommended) if it does not exist
python -m venv .venv

# Activate virtual environment: Only do this if repository does not contain a .venv file
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt


pip install google-generativeai PyPDF2 python-docx python-dotenv

pip uninstall bcrypt
pip install "bcrypt==3.2.0"
```

3. **Set up the frontend:**

```bash
cd ../client

# Install Node.js dependencies
npm install
```

4. **Configure environment variables:**

Create a `server/.env` file:

```env
# Database
DATABASE_URL=sqlite:///./ai_recruiter.db

# JWT Authentication
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# SMTP Email Configuration (optional - emails won't send without this)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_USE_TLS=true
```

5. **Initialize the database:**

The database will be automatically created on first run. The FastAPI app creates tables on startup.

6. **Start the development servers:**

**Terminal 1 - Backend:**
```bash
cd server
python main.py
# Or with uvicorn:
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs` (FastAPI automatic documentation)

## Project Structure

```
ai-recruiter/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── api/                # API client (axios configuration)
│   │   ├── components/         # Reusable React components
│   │   │   ├── Layout.tsx      # Main layout with sidebar
│   │   │   └── ui/             # shadcn-style UI components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── input.tsx
│   │   │       └── textarea.tsx
│   │   ├── lib/                # Utility functions
│   │   │   └── utils.ts        # cn() helper for className merging
│   │   ├── pages/              # Page components
│   │   │   ├── Landing.tsx     # Public landing page
│   │   │   ├── Login.tsx       # Login page
│   │   │   ├── SignUp.tsx      # Registration page
│   │   │   ├── Dashboard.tsx   # Admin/Candidate dashboard
│   │   │   ├── ActiveJobs.tsx  # Browse/apply to jobs
│   │   │   ├── PostJob.tsx     # Admin: Create job posting
│   │   │   ├── Applications.tsx # View applications
│   │   │   ├── MatchingCandidates.tsx # Admin: Review candidates
│   │   │   ├── Profile.tsx     # User profile
│   │   │   └── Settings.tsx   # Account settings
│   │   ├── store/             # State management
│   │   │   └── authStore.ts   # Zustand auth store
│   │   ├── App.tsx            # Main app component with routing
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles + Tailwind
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vite.config.ts         # Vite configuration
│   └── package.json
│
├── server/                     # Backend FastAPI application
│   ├── main.py                # FastAPI app and routes
│   ├── models.py              # SQLModel database models
│   ├── db.py                  # Database connection
│   ├── security.py            # Password hashing and JWT
│   ├── ai_processing.py       # AI resume screening logic
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/               # Uploaded resume files
│   │   └── resumes/
│   └── ai_recruiter.db        # SQLite database (auto-created)
│
└── README.md                  # This file
```

## API Endpoints

### Authentication
- `POST /token` - Login (OAuth2 password flow)
- `POST /users/register` - Register new user (Admin or Candidate)
- `GET /users/me` - Get current user profile

### Jobs
- `GET /jobs` - Get all job postings (public)
- `GET /jobs/{job_id}` - Get single job details
- `POST /jobs` - Create new job (Admin only)

### Applications
- `POST /applications/apply/{job_id}` - Submit application with resume (Candidate only)
- `GET /applications` - Get all applications (Admin only)
- `GET /applications/me` - Get my applications (Candidate only)
- `PATCH /applications/{id}` - Update application status (Admin only)
  - Triggers automatic email notification on status change

### Users
- `GET /users` - List all users (Admin only)
- `GET /users/{user_id}` - Get user by ID (Admin only)

## Key Features Explained

### AI-Powered Resume Screening
- Automatically extracts text from uploaded resumes
- Analyzes candidate qualifications against job requirements
- Provides AI reasoning for candidate matching
- Runs in background tasks for better performance

### Automated Email Notifications
When an admin updates an application status:
- **REJECTED**: Sends professional rejection email
- **ACCEPTED**: Sends next-stage notification email

Emails include:
- Personalized candidate name
- Job title and company name
- Professional messaging
- Next steps information

### Role-Based Access
- **ADMIN**: Can post jobs, view all applications, accept/reject candidates
- **CANDIDATE**: Can browse jobs, apply with resume, track applications

## Development

### Running in Development Mode

**Backend:**
```bash
cd server
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

**Backend:**
The FastAPI app can be deployed with any ASGI server (uvicorn, gunicorn, etc.)

### Database Management

The database is automatically created and managed by SQLModel. To reset:
1. Delete `server/ai_recruiter.db`
2. Restart the server (tables will be recreated)

## Environment Variables

### Required
- `SECRET_KEY` - JWT signing secret
- `DATABASE_URL` - Database connection string

### Optional
- `ACCESS_TOKEN_EXPIRE_MINUTES` - JWT expiration (default: 30)
- `SMTP_HOST` - Email server host
- `SMTP_PORT` - Email server port (default: 587)
- `SMTP_USERNAME` - Email account username
- `SMTP_PASSWORD` - Email account password
- `SMTP_FROM` - From email address
- `SMTP_USE_TLS` - Enable TLS (default: true)

## UI Theme

The application uses a modern green-themed design:
- **Primary color**: Emerald green (#0e9666)
- **Background**: Soft mint (#f4fff9)
- **Typography**: Open Sans (Google Fonts)
- **Design style**: Glassmorphism with soft shadows
- **Components**: shadcn-inspired reusable UI components

## License

ISC
