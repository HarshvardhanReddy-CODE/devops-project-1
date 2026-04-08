from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'todoapp'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres')
    )

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected', 'error': str(e)}), 500

@app.route('/api/todos', methods=['GET'])
def get_todos():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM todos ORDER BY created_at DESC')
        todos = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([dict(row) for row in todos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/todos', methods=['POST'])
def create_todo():
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description', '')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            'INSERT INTO todos (title, description) VALUES (%s, %s) RETURNING *',
            (title, description)
        )
        todo = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(dict(todo)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        completed = data.get('completed')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if completed is not None:
            cur.execute('UPDATE todos SET completed = %s WHERE id = %s RETURNING *', (completed, todo_id))
        elif title and description:
            cur.execute('UPDATE todos SET title = %s, description = %s WHERE id = %s RETURNING *', 
                        (title, description, todo_id))
        else:
            return jsonify({'error': 'Invalid update data'}), 400
            
        todo = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if todo:
            return jsonify(dict(todo)), 200
        return jsonify({'error': 'Todo not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM todos WHERE id = %s', (todo_id,))
        affected = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        
        if affected > 0:
            return jsonify({'message': 'Todo deleted'}), 200
        return jsonify({'error': 'Todo not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
