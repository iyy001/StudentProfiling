from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from lightgbm import LGBMClassifier
import shap
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Global variables for model and explainer
model = None
explainer = None
feature_names = []

def prepare_features(student_profile, role):
    """
    Prepare features from student profile and role requirements
    """
    features = {}
    
    # Student skills
    student_skills = [s.get('name', '').lower() for s in student_profile.get('skills', [])]
    student_skill_levels = {s.get('name', '').lower(): s.get('level', 'beginner') 
                           for s in student_profile.get('skills', [])}
    
    # Project technologies
    projects = student_profile.get('projects', [])
    project_techs = []
    for project in projects:
        project_techs.extend([t.lower() for t in project.get('technologies', [])])
    
    # Internship skills
    internships = student_profile.get('internships', [])
    internship_skills = []
    for internship in internships:
        internship_skills.extend([s.lower() for s in internship.get('skillsGained', [])])
    
    # Combine all skills
    all_skills = set(student_skills + project_techs + internship_skills)
    
    # Required skills from role
    required_skills = [rs.get('skill', '').lower() for rs in role.get('requiredSkills', [])]
    preferred_skills = [ps.get('skill', '').lower() for ps in role.get('preferredSkills', [])]
    
    # Feature: Number of matched required skills
    features['matched_required_skills'] = len([s for s in required_skills if s in all_skills])
    features['total_required_skills'] = len(required_skills)
    features['matched_required_ratio'] = features['matched_required_skills'] / max(features['total_required_skills'], 1)
    
    # Feature: Number of matched preferred skills
    features['matched_preferred_skills'] = len([s for s in preferred_skills if s in all_skills])
    features['total_preferred_skills'] = len(preferred_skills)
    features['matched_preferred_ratio'] = features['matched_preferred_skills'] / max(features['total_preferred_skills'], 1)
    
    # Feature: Skill levels
    skill_levels = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    avg_skill_level = 0
    if student_skills:
        levels = [skill_levels.get(student_skill_levels.get(s, 'beginner'), 1) for s in student_skills]
        avg_skill_level = np.mean(levels) if levels else 0
    features['avg_skill_level'] = avg_skill_level
    
    # Feature: Number of projects
    features['num_projects'] = len(projects)
    
    # Feature: Number of internships
    features['num_internships'] = len(internships)
    
    # Feature: Number of certifications
    features['num_certifications'] = len(student_profile.get('certifications', []))
    
    # Feature: Academic performance (average CGPA)
    academics = student_profile.get('academics', [])
    cgpas = [a.get('cgpa', 0) for a in academics if a.get('cgpa')]
    features['avg_cgpa'] = np.mean(cgpas) if cgpas else 0
    
    # Feature: Weighted skill match (considering skill weights from role)
    weighted_match = 0
    total_weight = 0
    for rs in role.get('requiredSkills', []):
        skill_name = rs.get('skill', '').lower()
        weight = rs.get('weight', 1.0)
        total_weight += weight
        if skill_name in all_skills:
            weighted_match += weight
    features['weighted_skill_match'] = weighted_match / max(total_weight, 1)
    
    # Feature: Experience duration (from internships)
    total_experience_months = 0
    for internship in internships:
        # Simplified: assume 3 months per internship if dates not available
        total_experience_months += 3
    features['total_experience_months'] = total_experience_months
    
    return features

def train_model():
    """
    Train a LightGBM model on synthetic data
    In production, this would be trained on real student data
    """
    global model, explainer, feature_names
    
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000
    
    # Feature names
    feature_names = [
        'matched_required_skills', 'total_required_skills', 'matched_required_ratio',
        'matched_preferred_skills', 'total_preferred_skills', 'matched_preferred_ratio',
        'avg_skill_level', 'num_projects', 'num_internships', 'num_certifications',
        'avg_cgpa', 'weighted_skill_match', 'total_experience_months'
    ]
    
    # Generate synthetic features
    X = np.random.rand(n_samples, len(feature_names))
    
    # Normalize features to realistic ranges
    X[:, 0] = np.random.randint(0, 10, n_samples)  # matched_required_skills
    X[:, 1] = np.random.randint(5, 15, n_samples)  # total_required_skills
    X[:, 2] = X[:, 0] / np.maximum(X[:, 1], 1)  # matched_required_ratio
    X[:, 3] = np.random.randint(0, 8, n_samples)  # matched_preferred_skills
    X[:, 4] = np.random.randint(3, 10, n_samples)  # total_preferred_skills
    X[:, 5] = X[:, 3] / np.maximum(X[:, 4], 1)  # matched_preferred_ratio
    X[:, 6] = np.random.uniform(1, 3, n_samples)  # avg_skill_level
    X[:, 7] = np.random.randint(0, 10, n_samples)  # num_projects
    X[:, 8] = np.random.randint(0, 5, n_samples)  # num_internships
    X[:, 9] = np.random.randint(0, 5, n_samples)  # num_certifications
    X[:, 10] = np.random.uniform(6, 10, n_samples)  # avg_cgpa
    X[:, 11] = np.random.uniform(0, 1, n_samples)  # weighted_skill_match
    X[:, 12] = np.random.randint(0, 24, n_samples)  # total_experience_months
    
    # Generate target (readiness score: 0-100)
    # Higher scores for better matches
    y = (X[:, 2] * 40 + X[:, 5] * 20 + X[:, 6] * 10 + 
         X[:, 7] * 2 + X[:, 8] * 3 + X[:, 9] * 2 + 
         X[:, 10] * 2 + X[:, 11] * 15 + X[:, 12] * 0.5)
    y = np.clip(y, 0, 100)
    
    # Convert to classification (ready: >=70, partial: 50-69, not_ready: <50)
    y_class = np.where(y >= 70, 2, np.where(y >= 50, 1, 0))
    
    # Train model
    model = LGBMClassifier(n_estimators=100, learning_rate=0.1, random_state=42, verbose=-1)
    model.fit(X, y_class)
    
    # Create SHAP explainer
    explainer = shap.TreeExplainer(model)
    
    print("Model trained successfully")
    return model, explainer

# Initialize model on startup
train_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'ML Service is running'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        student_profile = data.get('studentProfile', {})
        role = data.get('role', {})
        
        # Prepare features
        features = prepare_features(student_profile, role)
        
        # Convert to array
        feature_array = np.array([[features.get(fname, 0) for fname in feature_names]])
        
        # Predict
        prediction = model.predict(feature_array)[0]
        prediction_proba = model.predict_proba(feature_array)[0]
        
        # Map prediction to readiness score
        readiness_score = prediction_proba[2] * 85 + prediction_proba[1] * 60 + prediction_proba[0] * 30
        
        # Get SHAP values
        shap_values = explainer.shap_values(feature_array)
        
        # For binary/multi-class, get values for the predicted class
        if isinstance(shap_values, list):
            shap_values = shap_values[prediction]
        
        # Create feature contributions
        feature_contributions = []
        for i, fname in enumerate(feature_names):
            feature_contributions.append({
                'feature': fname,
                'contribution': float(shap_values[0][i]),
                'value': float(feature_array[0][i])
            })
        
        # Sort by absolute contribution
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        # Generate explanation
        top_positive = [f for f in feature_contributions[:5] if f['contribution'] > 0]
        top_negative = [f for f in feature_contributions[:5] if f['contribution'] < 0]
        
        explanation = f"Predicted readiness: {['Not Ready', 'Partially Ready', 'Ready'][prediction]}. "
        if top_positive:
            explanation += f"Top positive factors: {', '.join([f['feature'] for f in top_positive[:3]])}. "
        if top_negative:
            explanation += f"Areas to improve: {', '.join([f['feature'] for f in top_negative[:3]])}."
        
        return jsonify({
            'readinessScore': float(readiness_score),
            'prediction': ['not_ready', 'partial', 'ready'][prediction],
            'predictionProba': {
                'not_ready': float(prediction_proba[0]),
                'partial': float(prediction_proba[1]),
                'ready': float(prediction_proba[2])
            },
            'shapValues': feature_contributions[:10],  # Top 10 contributions
            'explanation': explanation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train():
    """Retrain model with new data"""
    try:
        train_model()
        return jsonify({'message': 'Model retrained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

