from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    color = db.Column(db.String(7), default='#3B82F6')  # Default blue
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completions = db.relationship('HabitCompletion', backref='habit', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='habit', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'created_at': self.created_at.isoformat()
        }

class HabitCompletion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'habit_id': self.habit_id,
            'completed_at': self.completed_at.isoformat(),
            'note': self.note
        }

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    target_count = db.Column(db.Integer, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        # Calculate progress
        completions = HabitCompletion.query.filter(
            HabitCompletion.habit_id == self.habit_id,
            HabitCompletion.completed_at >= self.created_at,
            HabitCompletion.completed_at <= self.deadline
        ).count()

        return {
            'id': self.id,
            'habit_id': self.habit_id,
            'target_count': self.target_count,
            'current_count': completions,
            'deadline': self.deadline.isoformat(),
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'is_completed': completions >= self.target_count,
            'progress_percentage': min(100, (completions / self.target_count) * 100)
        }

# Helper Functions
def calculate_streak(habit_id):
    """Calculate current and longest streak for a habit"""
    completions = HabitCompletion.query.filter_by(habit_id=habit_id).order_by(HabitCompletion.completed_at.desc()).all()

    if not completions:
        return {'current_streak': 0, 'longest_streak': 0}

    # Get unique dates (ignore time)
    completion_dates = sorted(set(c.completed_at.date() for c in completions), reverse=True)

    # Calculate current streak
    current_streak = 0
    today = datetime.utcnow().date()
    expected_date = today

    for date in completion_dates:
        if date == expected_date or date == expected_date - timedelta(days=1):
            current_streak += 1
            expected_date = date - timedelta(days=1)
        else:
            break

    # Calculate longest streak
    longest_streak = 0
    temp_streak = 1

    for i in range(len(completion_dates) - 1):
        diff = (completion_dates[i] - completion_dates[i + 1]).days
        if diff == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak)

    return {
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }

# API Routes

@app.route('/api/habits', methods=['GET'])
def get_habits():
    """Get all habits"""
    habits = Habit.query.all()
    return jsonify([habit.to_dict() for habit in habits])

@app.route('/api/habits', methods=['POST'])
def create_habit():
    """Create a new habit"""
    data = request.json
    habit = Habit(
        name=data['name'],
        description=data.get('description', ''),
        color=data.get('color', '#3B82F6')
    )
    db.session.add(habit)
    db.session.commit()
    return jsonify(habit.to_dict()), 201

@app.route('/api/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Update a habit"""
    habit = Habit.query.get_or_404(habit_id)
    data = request.json

    habit.name = data.get('name', habit.name)
    habit.description = data.get('description', habit.description)
    habit.color = data.get('color', habit.color)

    db.session.commit()
    return jsonify(habit.to_dict())

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Delete a habit"""
    habit = Habit.query.get_or_404(habit_id)
    db.session.delete(habit)
    db.session.commit()
    return '', 204

@app.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
def complete_habit(habit_id):
    """Mark a habit as completed for today with optional note"""
    habit = Habit.query.get_or_404(habit_id)
    data = request.json or {}

    completion = HabitCompletion(
        habit_id=habit_id,
        note=data.get('note', '')
    )
    db.session.add(completion)
    db.session.commit()

    return jsonify(completion.to_dict()), 201

@app.route('/api/habits/<int:habit_id>/completions', methods=['GET'])
def get_habit_completions(habit_id):
    """Get all completions for a habit"""
    habit = Habit.query.get_or_404(habit_id)
    completions = HabitCompletion.query.filter_by(habit_id=habit_id).order_by(HabitCompletion.completed_at.desc()).all()
    return jsonify([completion.to_dict() for completion in completions])

@app.route('/api/habits/<int:habit_id>/stats', methods=['GET'])
def get_habit_stats(habit_id):
    """Get statistics for a habit including streaks"""
    habit = Habit.query.get_or_404(habit_id)

    # Calculate streaks
    streaks = calculate_streak(habit_id)

    # Get total completions
    total_completions = HabitCompletion.query.filter_by(habit_id=habit_id).count()

    # Calculate completion rate for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_completions = HabitCompletion.query.filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completed_at >= thirty_days_ago
    ).count()
    completion_rate_30d = (recent_completions / 30) * 100

    # Check if completed today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = HabitCompletion.query.filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completed_at >= today_start
    ).first() is not None

    return jsonify({
        'habit_id': habit_id,
        'current_streak': streaks['current_streak'],
        'longest_streak': streaks['longest_streak'],
        'total_completions': total_completions,
        'completion_rate_30d': round(completion_rate_30d, 1),
        'completed_today': completed_today
    })

@app.route('/api/goals', methods=['GET'])
def get_goals():
    """Get all goals"""
    goals = Goal.query.all()
    return jsonify([goal.to_dict() for goal in goals])

@app.route('/api/goals', methods=['POST'])
def create_goal():
    """Create a new goal"""
    data = request.json
    goal = Goal(
        habit_id=data['habit_id'],
        target_count=data['target_count'],
        deadline=datetime.fromisoformat(data['deadline']),
        description=data.get('description', '')
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """Delete a goal"""
    goal = Goal.query.get_or_404(goal_id)
    db.session.delete(goal)
    db.session.commit()
    return '', 204

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard overview data"""
    habits = Habit.query.all()
    dashboard_data = []

    for habit in habits:
        stats = calculate_streak(habit.id)

        # Check if completed today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        completed_today = HabitCompletion.query.filter(
            HabitCompletion.habit_id == habit.id,
            HabitCompletion.completed_at >= today_start
        ).first() is not None

        dashboard_data.append({
            'habit': habit.to_dict(),
            'current_streak': stats['current_streak'],
            'completed_today': completed_today
        })

    return jsonify(dashboard_data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
