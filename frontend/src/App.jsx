import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`)
      setTodos(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch todos. Make sure the API is running.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      if (editingId) {
        await axios.put(`${API_URL}/todos/${editingId}`, {
          title,
          description
        })
        setEditingId(null)
      } else {
        await axios.post(`${API_URL}/todos`, {
          title,
          description
        })
      }
      setTitle('')
      setDescription('')
      fetchTodos()
    } catch (err) {
      setError('Failed to save todo')
    }
    setLoading(false)
  }

  const handleEdit = (todo) => {
    setEditingId(todo.id)
    setTitle(todo.title)
    setDescription(todo.description || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`)
      fetchTodos()
    } catch (err) {
      setError('Failed to delete todo')
    }
  }

  const handleToggleComplete = async (todo) => {
    try {
      await axios.put(`${API_URL}/todos/${todo.id}`, {
        completed: !todo.completed
      })
      fetchTodos()
    } catch (err) {
      setError('Failed to update todo')
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Todo App</h1>
        <p>Manage your tasks with ease</p>
      </header>

      {error && <div className="error">{error}</div>}

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter todo title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Enter description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Add Todo'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty">No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-content" onClick={() => handleToggleComplete(todo)}>
                <span className="checkbox">
                  {todo.completed ? '✓' : '○'}
                </span>
                <div className="todo-text">
                  <span className="todo-title">{todo.title}</span>
                  {todo.description && (
                    <span className="todo-desc">{todo.description}</span>
                  )}
                </div>
              </div>
              <div className="todo-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleEdit(todo)}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(todo.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App