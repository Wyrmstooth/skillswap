# SkillSwap

SkillSwap is a full-stack web application that enables users to exchange skills with one another. Users can post tasks they need help with, find skilled individuals to assist them, and build their professional network while sharing expertise.

## Features

- **User Authentication**: Secure user registration and login
- **Skill Marketplace**: Browse and post skills you want to offer or learn
- **Task Management**: Create, view, and manage tasks
- **Messaging**: Direct messaging between users
- **Ratings & Reviews**: Rate and review completed tasks
- **User Profiles**: Showcase your skills and achievements

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: (Database configuration in `db.js`)
- **Authentication**: Custom JWT-based auth middleware

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: CSS
- **HTTP Client**: Axios

## Project Structure

```
skillswap/
├── backend/
│   ├── server.js           # Main server entry point
│   ├── db.js              # Database configuration
│   ├── package.json        # Backend dependencies
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── users.js       # User endpoints
│   │   ├── skills.js      # Skills endpoints
│   │   ├── tasks.js       # Tasks endpoints
│   │   ├── messages.js    # Messaging endpoints
│   │   └── ratings.js     # Ratings endpoints
│   └── db/                # Database migrations/seeds
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   ├── App.jsx        # Main app component
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API services
│   │   └── assets/        # Images and static files
│   ├── public/            # Static files
│   ├── vite.config.js     # Vite configuration
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML template
└── start.bat              # Quick start script

```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Create .env file with necessary environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Quick Start

Run the included batch file to start the application:

```bash
start.bat
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile

### Skills
- `GET /skills` - Get all skills
- `POST /skills` - Create a new skill
- `DELETE /skills/:id` - Delete a skill

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Messages
- `GET /messages` - Get all messages
- `POST /messages` - Send a message

### Ratings
- `POST /ratings` - Create a rating/review
- `GET /ratings/:id` - Get ratings for a task/user

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For support, email support@skillswap.com or open an issue in the GitHub repository.

---

Made with ❤️ by the SkillSwap Team
