import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [user, setUser] = useState(null)
  const [isManager, setIsManager] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: ""
  })

  // Check authentication and get user info
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const userData = localStorage.getItem("user")

    if (!token) {
      navigate("/")
      return
    }

    setIsManager(role === "manager")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [navigate])

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

                  
      setTasks(res.data.tasks || res.data)

    } catch (err) {
      console.log("Fetch tasks error:", err)
      setError("Failed to fetch tasks")
    }
  }

  // Fetch employees (for managers)
  const fetchEmployees = async () => {
    if (!isManager) return
    
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const employeesOnly = res.data.users || res.data || []
      setEmployees(employeesOnly)
    } catch (err) {
      console.log("Error fetching employees:", err)
    }
  }

  useEffect(() => {
    if (user) {
      Promise.all([fetchTasks(), fetchEmployees()]).finally(() => {
        setLoading(false)
      })
    }
  }, [user])

  // Create task
  const createTask = async () => {
    if (!taskForm.title.trim()) {
      setError("Please enter a task title")
      return
    }
    
    if (!taskForm.assignedTo) {
      setError("Please assign the task to an employee")
      return
    }

    const taskData = { 
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log("Task creation response:", response.data)

      setTaskForm({ title: "", description: "", assignedTo: "" })
      setError("")
      setShowCreateModal(false)
      fetchTasks()

    } catch (err) {
      console.log("Task creation error:", err)
      setError("Failed to create task")
    }
  }

  // Update task status
  const updateTaskStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/tasks/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchTasks()

    } catch (err) {
      console.log(err)
      setError("Failed to update task status")
    }
  }

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return
    
    try {
      const token = localStorage.getItem("token")
      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchTasks()

    } catch (err) {
      console.log(err)
      setError("Failed to delete task")
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/")
  }

  // Task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "To Do").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                  {isManager ? "Manager" : "Employee"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.todo}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Button - Managers Only */}
        {isManager && (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Task
            </button>
          </div>
        )}

        
        {/* Tasks List */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first task to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => (
                <div key={t._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                        <div className="flex items-center space-x-2">
                          {!isManager && (
                            <select
                              value={t.status}
                              onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            t.status === "Completed" ? "bg-green-100 text-green-800" :
                            t.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Always show description section */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 font-medium mb-1">Description:</p>
                        <p className="text-sm text-gray-600">
                          {t.description || "No description provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Show assignment info only for managers */}
                        {isManager && (
                          <div className="flex items-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Assigned to:</p>
                              {t.assignedTo ? (
                                <>
                                  <p className="text-sm text-blue-700">{t.assignedTo.name}</p>
                                  {t.assignedTo.email && (
                                    <p className="text-xs text-blue-600">{t.assignedTo.email}</p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-blue-700">Not assigned</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Show creator info for both roles */}
                        <div className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200">
                          <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-green-900">Created by:</p>
                            {t.assignedBy ? (
                              <>
                                <p className="text-sm text-green-700">{t.assignedBy.name}</p>
                                {t.assignedBy.email && (
                                  <p className="text-xs text-green-600">{t.assignedBy.email}</p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-green-700">Unknown</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Unknown date"}
                        </div>
                      </div>
                    </div>
                    
                    {isManager && (
                      <button
                        onClick={() => deleteTask(t._id)}
                        className="text-red-600 hover:text-red-800 transition-colors ml-4"
                        title="Delete Task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </label>
                <textarea
                  id="taskDescription"
                  placeholder="Enter task description (optional)"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows="3"
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Employee *
                </label>
                <select
                  id="assignTo"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select an employee</option>
                  {employees && employees.length > 0 ? (
                    employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))
                  ) : (
                    <option value="">No employees available</option>
                  )}
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  className="flex-1 btn-primary"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
