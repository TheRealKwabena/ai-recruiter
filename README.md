# Job Recruitment Platform - MVP

A full-stack web application for job recruitment and candidate management, built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### Authentication
- User registration and login
- Password reset functionality
- Onboarding flow for new employers
- JWT-based authentication

### Dashboard
- Statistics overview (Total Jobs, Applications, Hired, Candidate Pool)
- Recent reviews and mentions
- Shortlisted candidates

### Job Management
- Post new job listings
- View active and archived jobs
- Job posting confirmation modal
- Job details and editing

### Candidate Management
- View matching candidates for jobs
- Candidate profile details
- Shortlist/Reject candidates
- Schedule interviews
- Application status tracking

### Messaging
- Real-time messaging between users
- Conversation list
- Message history

### Network
- View connections
- Discover suggested connections
- Connect with other users

### Settings
- Account information management
- Password change
- Notification settings

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Zustand (State Management)
- Axios

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discrete_project
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up the database:
   - Create a PostgreSQL database
   - Copy `server/.env.example` to `server/.env`
   - Update the `DATABASE_URL` in `server/.env` with your database credentials

4. Run database migrations:
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

5. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Environment Variables

Create a `server/.env` file with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/job_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

## Project Structure

```
discrete_project/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # State management
│   │   ├── api/           # API utilities
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                # Backend Express application
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `POST /api/jobs/:id/post` - Post job (make it active)
- `POST /api/jobs/:id/archive` - Archive job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications/job/:jobId` - Get applications for a job
- `GET /api/applications/job/:jobId/matching` - Get matching candidates
- `GET /api/applications/:id` - Get single application
- `PATCH /api/applications/:id` - Update application status

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message

### Connections
- `GET /api/connections` - Get connections
- `GET /api/connections/suggested` - Get suggested connections
- `POST /api/connections/:userId` - Create connection request
- `POST /api/connections/:id/accept` - Accept connection

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/reviews` - Get recent reviews
- `GET /api/dashboard/shortlisted` - Get shortlisted candidates

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Database Management

```bash
cd server
npm run prisma:studio  # Open Prisma Studio to view/edit database
npm run prisma:migrate # Run migrations
```

## License

ISC

