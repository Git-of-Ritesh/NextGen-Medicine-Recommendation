# Alternative Medicine Recommendation System

A full-stack web application that provides personalized alternative medicine recommendations based on user symptoms, health factors, and preferences. The system uses machine learning to suggest appropriate remedies and alternative medicines.

## Features

- User authentication and profile management
- Symptom-based medicine recommendations
- Alternative medicine search
- Personalized recommendations based on:
  - Multiple symptoms
  - Health factors
  - Age group
  - Severity level
  - User preferences
- Real-time streaming recommendations
- Modern and responsive UI

## Tech Stack

### Frontend
- React.js
- React Router
- React Markdown
- Papa Parse (CSV parsing)
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Express Rate Limiter
- Express Validator

### Python Microservice
- Python 3.x
- Flask
- Scikit-learn
- Pandas
- NumPy

## Prerequisites

- Node.js (v14 or higher)
- Python 3.x
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Alternative-Medicine-Recommendation.git
cd Alternative-Medicine-Recommendation
```

2. Install Frontend Dependencies:
```bash
npm install
```

3. Install Backend Dependencies:
```bash
cd backend
npm install
```

4. Install Python Dependencies:
```bash
cd ../python_microservice
pip install -r requirements.txt
```

5. Set up Environment Variables:

Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

## Project Structure

```
Alternative-Medicine-Recommendation/
├── backend/                 # Node.js backend
│   ├── controller/         # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── index.js           # Main server file
├── python_microservice/    # ML recommendation service
│   ├── app/               # Flask application
│   ├── models/            # ML models
│   └── train_model.py     # Model training script
├── src/                   # React frontend
│   ├── pages/            # React components
│   ├── dataset/          # Medicine dataset
│   └── App.js            # Main React component
└── datasets/             # Raw datasets
```

## Running the Application

1. Start the Backend Server:
```bash
cd backend
npm start
```

2. Start the Python Microservice:
```bash
cd python_microservice
python app/app.py
```

3. Start the Frontend Development Server:
```bash
cd ../
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Python Microservice: http://localhost:5002

## Workflow

1. **User Authentication**:
   - Users can register and login
   - JWT tokens are used for authentication
   - Profile management available

2. **Medicine Recommendations**:
   - Users can input multiple symptoms
   - Select relevant health factors
   - Choose age group and severity
   - Get personalized recommendations

3. **Alternative Medicine Search**:
   - Search for conventional medicines
   - Get alternative medicine suggestions
   - View detailed information about alternatives

4. **ML-based Recommendations**:
   - Python microservice processes requests
   - Uses trained model for predictions
   - Returns personalized recommendations

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- POST `/api/auth/logout` - User logout

### Recommendations
- POST `/api/recommendations/stream` - Get streaming recommendations
- POST `/api/alternative-medicines` - Search alternative medicines

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dataset sources
- Open-source libraries used
- Contributors and maintainers
