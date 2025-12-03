import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';


export default function DragDropDemo() {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentTask, setCurrentTask] = useState({ 
    id: null, 
    text: '', 
    completed: false,
    missed: false,
    dueDate: '',
    dueTime: ''
  });
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultTasks = [
        { 
          id: Date.now() + 1, 
          text: 'Complete project proposal', 
          completed: false,
          missed: false,
          dueDate: tomorrow.toISOString().split('T')[0],
          dueTime: '14:00'
        },
        { 
          id: Date.now() + 2, 
          text: 'Review code changes', 
          completed: false,
          missed: false,
          dueDate: tomorrow.toISOString().split('T')[0],
          dueTime: '16:00'
        },
        { 
          id: Date.now() + 3, 
          text: 'Update documentation', 
          completed: false,
          missed: false,
          dueDate: tomorrow.toISOString().split('T')[0],
          dueTime: '18:00'
        },
      ];
      setTasks(defaultTasks);
      localStorage.setItem('tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    const checkMissedTasks = () => {
      const now = new Date();
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (!task.completed && !task.missed && task.dueDate && task.dueTime) {
            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            if (now > dueDateTime) {
              return { ...task, missed: true };
            }
          }
          return task;
        })
      );
    };

    checkMissedTasks();
    const interval = setInterval(checkMissedTasks, 60000);

    return () => clearInterval(interval);
  }, []);

  const quickAddTask = () => {
    if (!newTaskText.trim()) return;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      missed: false,
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '12:00'
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const openModal = (mode, task = null) => {
    setModalMode(mode);
    if (mode === 'edit' && task) {
      setCurrentTask(task);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCurrentTask({ 
        id: null, 
        text: '', 
        completed: false,
        missed: false,
        dueDate: tomorrow.toISOString().split('T')[0],
        dueTime: '12:00'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentTask({ 
      id: null, 
      text: '', 
      completed: false,
      missed: false,
      dueDate: '',
      dueTime: ''
    });
  };

  const handleSubmit = () => {
    if (!currentTask.text.trim() || !currentTask.dueDate || !currentTask.dueTime) return;

    if (modalMode === 'add') {
      const newTask = {
        ...currentTask,
        id: Date.now(),
      };
      setTasks([...tasks, newTask]);
    } else if (modalMode === 'edit') {
      setTasks(tasks.map(task => task.id === currentTask.id ? currentTask : task));
    }
    closeModal();
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedTask && draggedTask.index !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.index !== dropIndex) {
      const newTasks = [...tasks];
      const draggedItem = newTasks[draggedTask.index];
      
      newTasks.splice(draggedTask.index, 1);
      newTasks.splice(dropIndex, 0, draggedItem);
      
      setTasks(newTasks);
    }
    
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
    
    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return `${dateStr} at ${timeStr}`;
  };

  const getTaskStatus = (task) => {
    if (task.completed) return 'completed';
    if (task.missed) return 'missed';
    return 'pending';
  };

  return (
    <>
      <Navbar />
      <div className="body">
        
        <div className="container container-padding">
          <div className="header">
            <h1 className="title">Task Board</h1>
            <p className="subtitle">Drag to reorder tasks • Auto-marks missed deadlines</p>
          </div>
          
          <div className="controls-row">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && quickAddTask()}
              placeholder="Add a new task..."
              className="quick-input"
            />
            <button 
              onClick={quickAddTask}
              className="add-btn"
            >
              Add Task
            </button>
          </div>
          
          <div className="card-container">
            <div className="task-grid">
              {tasks.map((task, index) => {
                const status = getTaskStatus(task);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`task ${draggedTask?.index === index ? 'dragging' : ''} ${status} ${dragOverIndex === index ? 'drag-over' : ''}`}
                  >
                    <div className="task-content">
                      <div className="drag-handle">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                      
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id)}
                        className="checkbox"
                        disabled={task.missed}
                      />
                      
                      <div className="task-info">
                        <div className={`task-text ${task.completed || task.missed ? 'strikethrough' : ''}`}>
                          {task.text}
                        </div>
                        <div className="task-meta">
                          <span className="due-date-time">
                            ⏰ {formatDateTime(task.dueDate, task.dueTime)}
                          </span>
                          {status === 'missed' && (
                            <span className="missed-badge">MISSED</span>
                          )}
                          {status === 'completed' && (
                            <span className="completed-badge">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="task-actions task-actions-responsive">
                      <button
                        onClick={() => openModal('edit', task)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {tasks.length === 0 && (
              <div className="empty-state">
                <p className="empty-text">No tasks yet!</p>
                <p className="empty-subtext">Add a task to get started</p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal modal-responsive" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">
                {modalMode === 'add' ? 'Add New Task' : 'Edit Task'}
              </h2>
              
              <div>
                <div className="form-group">
                  <label className="label">Task Description *</label>
                  <input
                    type="text"
                    value={currentTask.text}
                    onChange={(e) => setCurrentTask({ ...currentTask, text: e.target.value })}
                    placeholder="Enter task description..."
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label className="label">Due Date *</label>
                    <input
                      type="date"
                      value={currentTask.dueDate}
                      onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="label">Due Time *</label>
                    <input
                      type="time"
                      value={currentTask.dueTime}
                      onChange={(e) => setCurrentTask({ ...currentTask, dueTime: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    onClick={closeModal}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="submit-btn"
                  >
                    {modalMode === 'add' ? 'Add Task' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}