[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19886286&assignment_repo_type=AssignmentRepo)
# MERN Stack Blog Application

A full-stack blog application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that demonstrates seamless integration between front-end and back-end components.

## Features

- RESTful API with Express.js and MongoDB
- React front-end with component architecture
- Full CRUD functionality for blog posts
- User authentication and authorization
- Advanced features:
  - Image uploads for posts and user profiles
  - Comments on blog posts
  - Categories for organizing posts
  - Search functionality
  - Pagination for post lists

## Project Structure

```
mern-blog/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application component
│   └── .env.example        # Environment variables template
├── server/                 # Express.js back-end
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files
│   ├── server.js           # Main server file
│   └── .env.example        # Environment variables template
└── README.md               # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn
- Git

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and other configuration values.

5. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL and other configuration values.

5. Start the client:
   ```
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register a new user | Public |
| POST | /api/auth/login | Authenticate user & get token | Public |
| GET | /api/auth/me | Get current user | Private |
| PUT | /api/auth/profile | Update user profile | Private |
| PUT | /api/auth/password | Change password | Private |

### Posts Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/posts | Get all posts with pagination | Public |
| GET | /api/posts/:id | Get a specific post | Public |
| POST | /api/posts | Create a new post | Private |
| PUT | /api/posts/:id | Update a post | Private |
| DELETE | /api/posts/:id | Delete a post | Private |
| POST | /api/posts/:id/comments | Add a comment to a post | Private |
| GET | /api/posts/search | Search posts | Public |

### Categories Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/categories | Get all categories | Public |
| GET | /api/categories/:id | Get a specific category | Public |
| POST | /api/categories | Create a new category | Private (Admin) |
| PUT | /api/categories/:id | Update a category | Private (Admin) |
| DELETE | /api/categories/:id | Delete a category | Private (Admin) |

## User Roles and Permissions

- **Guest**: Can view posts, categories, and comments
- **User**: Can create, edit, and delete their own posts and comments
- **Admin**: Can manage all posts, comments, and categories

## Technologies Used

### Backend
- Node.js and Express.js for the server
- MongoDB and Mongoose for the database
- JWT for authentication
- Express Validator for input validation
- Bcrypt for password hashing

### Frontend
- React.js for the UI
- React Router for navigation
- Context API for state management
- Axios for API requests
- React Toastify for notifications


## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
