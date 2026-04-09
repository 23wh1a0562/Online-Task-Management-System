import { useState } from 'react'

const TaskCard = ({ task, onUpdateStatus, onDelete, isManager }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const statusColors = {
    "To Do": "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Completed": "bg-green-100 text-green-800"
  }

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true)
    try {
      await onUpdateStatus(task._id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>

      {/* Task Assignment Info */}
      <div className="mb-4 text-sm text-gray-500">
        {task.assignedTo && (
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assigned to: {task.assignedTo.name || 'Unknown'}
          </div>
        )}
        {task.assignedBy && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Status Update (for employees) */}
        {!isManager && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Update Status:</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        {/* Delete Button (for managers) */}
        {isManager && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="Delete Task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isUpdating && (
        <div className="mt-2 text-sm text-blue-600 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}
    </div>
  )
}

export default TaskCard
