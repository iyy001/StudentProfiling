
# Maatram Student Profiling System

An AI-powered platform for student career guidance and profiling that helps students identify ideal career paths and provides administrators with data-driven insights.

## Features

### Student Dashboard
- **Profile Management**: Self-entry of academic progress, skills, projects, internships, certifications, and career aspirations
- **AI Career Recommendations**: Personalized career recommendations with explainable AI insights (SHAP)
- **Role-Based Skill Guidance**: Select a role to see required vs. missing skills with suggested courses/projects
- **Real-time Updates**: All changes are reflected immediately on dashboards

### Admin Dashboard
- **Student Management**: Search, sort, and filter students by role, college, skills, readiness score
- **Student Profiles**: View complete student profiles including academics, skills, internships, projects, certifications, and aspirations
- **Data Verification**: Update or verify student-entered data
- **Analytics Dashboard**: Visual analytics including skill distribution, role readiness, batch performance, and top candidates
- **Role Management**: Create and manage career roles with required/preferred skills

### AI & ML Features
- **Rule-based Scoring**: Readiness Score = (Number of Matched Skills / Total Required Skills) × 100
- **ML Models**: LightGBM-based predictions for role suitability (optional)
- **Explainable AI**: SHAP values showing positive/negative contributions for each feature

## Tech Stack

- **Frontend**: React.js, Chart.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **AI/ML**: Python, Flask, LightGBM, SHAP, scikit-learn
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Maatram
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install ML Service Dependencies

```bash
cd ml_service
pip install -r requirements.txt
cd ..
```

### 5. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maatram
JWT_SECRET=your_secret_key_here
ML_SERVICE_URL=http://localhost:5001
```

### 6. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
mongod

# On Linux/Mac
sudo systemctl start mongod
```

## Running the Application

### Option 1: Run All Services Separately

1. **Start the Backend Server**:
```bash
npm run dev
```

2. **Start the Frontend** (in a new terminal):
```bash
npm run client
```

3. **Start the ML Service** (in a new terminal, optional):
```bash
cd ml_service
python app.py
```

### Option 2: Run Backend and Frontend Together

```bash
npm run dev:all
```

Note: You'll still need to start the ML service separately if you want ML predictions.

## Default Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001

## Usage

### Student Registration/Login

1. Navigate to http://localhost:3000
2. Register a new account (select "Student" role)
3. Login with your credentials
4. Fill in your profile:
   - Personal Information
   - Skills
   - Projects
   - Internships
   - Certifications
   - Career Aspirations

### Viewing Recommendations

1. Go to "Career Recommendations" tab
2. View AI-generated career recommendations based on your profile
3. Check readiness scores and matched/missing skills

### Role-Based Guidance

1. Go to "Role-Based Guidance" tab
2. Select a role from the dropdown
3. View required skills, missing skills, and suggested courses
4. See AI explanations (feature contributions)

### Admin Dashboard

1. Register/Login with "Admin" role
2. Access admin dashboard at http://localhost:3000/admin
3. View all students, filter by various criteria
4. Check analytics and role readiness
5. Manage roles and verify student data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Student Routes
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile/:section` - Update profile section

### Admin Routes
- `GET /api/admin/students` - Get all students (with filters)
- `GET /api/admin/students/:id` - Get student details
- `PUT /api/admin/students/:id` - Update student
- `GET /api/admin/analytics/dashboard` - Get dashboard analytics
- `GET /api/admin/analytics/skills` - Get skill distribution
- `GET /api/admin/analytics/role-readiness` - Get role readiness data

### Recommendations
- `GET /api/recommendations` - Get career recommendations
- `GET /api/recommendations/role/:roleId` - Get role-specific guidance
- `POST /api/recommendations/ml-predict` - Get ML prediction (optional)

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role details
- `POST /api/admin/roles` - Create role (admin only)
- `PUT /api/admin/roles/:id` - Update role (admin only)
- `DELETE /api/admin/roles/:id` - Delete role (admin only)

## Project Structure

```
Maatram/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   ├── middleware/        # Auth middleware
│   └── index.js
├── ml_service/            # Python ML service
│   ├── app.py            # Flask application
│   └── requirements.txt
├── package.json
└── README.md
```

## Data Models

### User
- email, password, role (student/admin)
- studentProfile reference

### StudentProfile
- personalInfo (name, college, degree, etc.)
- academics (semester grades, courses)
- skills (name, level, certification)
- projects (title, description, technologies)
- internships (company, role, skills gained)
- certifications
- extracurricular activities
- careerAspirations (desired roles, industries)
- readinessScores (Map of role -> score data)

### Role
- name, description, industry
- requiredSkills (skill, level, weight)
- preferredSkills
- courses, resources
- averageSalary, growthProspect

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Admin routes protected with adminAuth middleware
- Environment variables for sensitive data

## Future Enhancements

- Complete project/internship/certification editing forms
- Advanced ML model training with real student data
- Email notifications
- Export reports (PDF/Excel)
- Integration with external job portals
- Real-time chat support
- Mobile app

## License

MIT License

## Contributors

Maatram Foundation

## Support

For issues and questions, please contact the development team.


