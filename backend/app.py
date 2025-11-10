from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Database Models
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    color = db.Column(db.String(7), default='#3B82F6')  # Default blue
    frequency = db.Column(db.Integer, default=1)  # Cooldown in days (1 = daily, 2 = every 2 days, etc.)
    initial_streak = db.Column(db.Integer, default=0)  # Starting streak for habits tracked before app
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completions = db.relationship('HabitCompletion', backref='habit', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='habit', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'frequency': self.frequency,
            'initial_streak': self.initial_streak,
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
def get_current_day():
    """Get current day with 3 AM cutoff - day starts at 3 AM"""
    now = datetime.utcnow()
    if now.hour < 3:
        # Before 3 AM, we're still in the previous day
        return (now - timedelta(days=1)).date()
    return now.date()

def get_next_3am():
    """Get the next 3 AM timestamp"""
    now = datetime.utcnow()
    next_3am = now.replace(hour=3, minute=0, second=0, microsecond=0)
    if now.hour >= 3:
        # If it's already past 3 AM today, get tomorrow's 3 AM
        next_3am += timedelta(days=1)
    return next_3am

def get_cooldown_info(habit_id, frequency):
    """Calculate cooldown status for a habit"""
    last_completion = HabitCompletion.query.filter_by(habit_id=habit_id).order_by(HabitCompletion.completed_at.desc()).first()

    if not last_completion:
        return {
            'on_cooldown': False,
            'cooldown_end': None,
            'is_available': True
        }

    # Calculate when the cooldown ends (last completion + frequency days, at 3 AM)
    last_completion_day = last_completion.completed_at.date()
    cooldown_end_day = last_completion_day + timedelta(days=frequency)
    cooldown_end = datetime.combine(cooldown_end_day, datetime.min.time()).replace(hour=3, minute=0, second=0)

    current_day = get_current_day()
    on_cooldown = current_day < cooldown_end_day

    return {
        'on_cooldown': on_cooldown,
        'cooldown_end': cooldown_end.isoformat() if on_cooldown else None,
        'is_available': not on_cooldown
    }

def calculate_streak(habit_id, frequency=1, initial_streak=0):
    """Calculate current and longest streak for a habit with frequency support and initial streak"""
    completions = HabitCompletion.query.filter_by(habit_id=habit_id).order_by(HabitCompletion.completed_at.desc()).all()

    if not completions:
        # If no completions yet, return initial streak
        return {'current_streak': initial_streak, 'longest_streak': initial_streak}

    # Get unique dates (ignore time)
    completion_dates = sorted(set(c.completed_at.date() for c in completions), reverse=True)

    # Calculate current streak with frequency
    current_streak = 0
    current_day = get_current_day()
    expected_date = current_day

    for date in completion_dates:
        # Allow completion on expected date or within frequency window
        days_diff = (expected_date - date).days
        if days_diff >= 0 and days_diff < frequency:
            current_streak += 1
            expected_date = date - timedelta(days=frequency)
        else:
            break

    # Add initial streak to current streak
    current_streak += initial_streak

    # Calculate longest streak with frequency
    longest_streak = 0
    temp_streak = 1

    for i in range(len(completion_dates) - 1):
        diff = (completion_dates[i] - completion_dates[i + 1]).days
        # Allow streak to continue if within frequency window
        if diff <= frequency:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak)

    # Add initial streak to longest streak
    longest_streak += initial_streak

    # Ensure current streak is at least considered for longest
    longest_streak = max(longest_streak, current_streak)

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
        color=data.get('color', '#3B82F6'),
        frequency=data.get('frequency', 1),
        initial_streak=data.get('initial_streak', 0)
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
    habit.frequency = data.get('frequency', habit.frequency)

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

    # Calculate streaks with frequency and initial streak
    streaks = calculate_streak(habit_id, habit.frequency, habit.initial_streak)

    # Get total completions
    total_completions = HabitCompletion.query.filter_by(habit_id=habit_id).count()

    # Calculate completion rate for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_completions = HabitCompletion.query.filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completed_at >= thirty_days_ago
    ).count()
    completion_rate_30d = (recent_completions / 30) * 100

    # Get cooldown info
    cooldown = get_cooldown_info(habit_id, habit.frequency)

    return jsonify({
        'habit_id': habit_id,
        'current_streak': streaks['current_streak'],
        'longest_streak': streaks['longest_streak'],
        'total_completions': total_completions,
        'completion_rate_30d': round(completion_rate_30d, 1),
        'on_cooldown': cooldown['on_cooldown'],
        'cooldown_end': cooldown['cooldown_end'],
        'is_available': cooldown['is_available']
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
    """Get dashboard overview data with cooldown support"""
    habits = Habit.query.all()
    dashboard_data = []

    for habit in habits:
        stats = calculate_streak(habit.id, habit.frequency, habit.initial_streak)
        cooldown = get_cooldown_info(habit.id, habit.frequency)

        dashboard_data.append({
            'habit': habit.to_dict(),
            'current_streak': stats['current_streak'],
            'on_cooldown': cooldown['on_cooldown'],
            'cooldown_end': cooldown['cooldown_end'],
            'is_available': cooldown['is_available']
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
    app.run(debug=True, host='0.0.0.0', port=5001)
