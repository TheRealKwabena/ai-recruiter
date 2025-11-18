# Quick Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** - [Download](https://www.postgresql.org/download/)

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Server (backend)
- Client (frontend)

### 2. Set Up Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE job_platform;
```

2. Create `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env
```

3. Edit `server/.env` and update the database URL:
```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/job_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create database tables based on the schema

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## First Steps

1. **Sign Up**: Create a new employer account
2. **Onboarding**: Complete the onboarding process
3. **Post a Job**: Create your first job posting
4. **Explore**: Navigate through the dashboard and features

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database exists

### Port Already in Use
- Change the `PORT` in `server/.env` for backend
- Change the port in `client/vite.config.ts` for frontend

### Prisma Issues
- Run `npm run prisma:generate` again
- Check your database connection
- Ensure migrations are up to date

## Development Commands

### Root Directory
- `npm run dev` - Start both servers
- `npm run install:all` - Install all dependencies
- `npm run build` - Build for production

### Server Directory
- `npm run dev` - Start backend server
- `npm run build` - Build TypeScript
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Run database migrations

### Client Directory
- `npm run dev` - Start frontend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Database Management

### View Database
```bash
cd server
npm run prisma:studio
```

This opens a web interface to view and edit your database.

### Reset Database (Development Only)
```bash
cd server
npx prisma migrate reset
```

**Warning**: This will delete all data!

## Project Structure

```
discrete_project/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package.json
└── README.md        # Main documentation
```

## Next Steps

- Review the API endpoints in `README.md`
- Customize the UI components
- Add more features as needed
- Deploy to production

## Support

For issues or questions, check:
- `README.md` for detailed documentation
- API documentation in `server/src/routes/`
- Component documentation in `client/src/components/`

