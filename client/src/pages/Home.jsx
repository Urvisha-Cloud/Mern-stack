import { useNavigate } from 'react-router-dom';
import { logoutUserApi } from '../api/userApi';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { addTaskApi, deleteTaskApi, editTaskApi, getTaskApi } from '../api/taskApi';
import { addTodos, deleteTodos, editTodos, setTodos } from '../store/todoSlice';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { List, AutoSizer } from 'react-virtualized';
import '../App.css';

function DroppableColumn({ status, children }) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className="bg-gray-200 p-4 rounded min-h-[200px] overflow-visible">
      {children}
    </div>
  );
}

function DraggableTask({ task, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 100 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className="bg-white p-4 rounded shadow mb-3 hover:shadow-md cursor-pointer"
    >
      <h3 className="font-bold">{task.title}</h3>
      <p>{task.description}</p>
      <div className="text-xs text-gray-500 mt-2">
        <p><span className='text-sm text-gray-800 font-semibold'>Created:</span> {new Date(task.createdAt).toLocaleString()}</p>
        <p><span className='text-sm text-gray-800 font-semibold'>Updated:</span> {new Date(task.updatedAt).toLocaleString()}</p>
      </div>
      <div className="flex justify-between mt-2">
        <span className="bg-blue-100 px-2 py-1 rounded text-xs">{task.status}</span>
        <div>
          <button onClick={(e) => onClick(task)} className="text-green-600 w-5 h-7 p-1">
            <MdOutlineEdit />
          </button>
          <button onClick={(e) => onDelete(task._id, e)} className="text-red-500 w-5 h-7 p-1">
            <MdDeleteOutline />
          </button>
        </div>
      </div>
    </div>
  );
}

function VirtualTaskList({ tasks, onEdit, onDelete }) {
  const rowRenderer = ({ key, index, style }) => (
    <div key={key} style={{ ...style, overflow: 'visible' }}>
      <DraggableTask
        task={tasks[index]}
        onClick={onEdit}
        onDelete={onDelete}
      />
    </div>
  );

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <List
          width={width}
          height={600}
          rowCount={tasks.length}
          rowHeight={180}
          rowRenderer={rowRenderer}
          className='no-scrollbar'
          containerStyle={{ overflow: 'visible' }}
        />
      )}
    </AutoSizer>
  );
}

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todos);

  const [user, setUser] = useState(() => {
    const userStore = localStorage.getItem('user');
    return userStore ? JSON.parse(userStore) : null;
  });

  const [taskModal, setTaskModal] = useState(false);
  const [IsTask, setIsTask] = useState({ title: '', description: '', status: 'Pending' });
  const [editId, setEditId] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
  ];

  const activeTask = todos.find((task) => task._id === activeId);

  useEffect(() => {
    if (!user) navigate('/login');
    else setUser(user);
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getTaskApi(user._id);
      dispatch(setTodos(res?.task));
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      toast.error('Logout Failed..!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!IsTask.title || !IsTask.description) return toast.error('Fill all Fields..!');

    try {
      if (editId) {
        const res = await editTaskApi(editId, IsTask);
        dispatch(editTodos(res?.task));
        toast.success('Task updated successfully!');
      } else {
        const res = await addTaskApi(IsTask);
        dispatch(addTodos(res?.task));
        toast.success('Task added successfully!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Task operation failed');
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setTaskModal(false);
      setIsTask({ title: '', description: '', status: 'Pending' });
      setEditId(null);
    }, 300);
  };

  const openModal = () => {
    setTaskModal(true);
    setTimeout(() => setIsModalVisible(true), 10);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    try {
      await deleteTaskApi(id);
      dispatch(deleteTodos(id));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Task deletion failed');
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setIsTask({ title: task.title, description: task.description, status: task.status });
    openModal();
  };

  const getTasksByStatus = (status) => {
    return todos?.filter((task) => task.status === status) || [];
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeTask = todos.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overTask = todos.find((t) => t._id === over.id);
    const activeStatus = activeTask.status;

    const isOverColumn = !overTask;
    const overStatus = isOverColumn ? over.id : overTask.status;

    const sameColumn = activeStatus === overStatus;

    if (!sameColumn) {
      try {
        const res = await editTaskApi(active.id, { status: overStatus });
        dispatch(editTodos(res.task));
        toast.success('Task moved to another column!');
      } catch {
        toast.error('Move failed');
      }
    } else if (!isOverColumn) {
      const tasksInColumn = todos.filter((t) => t.status === activeStatus);
      const oldIndex = tasksInColumn.findIndex((t) => t._id === active.id);
      const newIndex = tasksInColumn.findIndex((t) => t._id === over.id);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(tasksInColumn, oldIndex, newIndex);
        const otherTasks = todos.filter((t) => t.status !== activeStatus);
        dispatch(setTodos([...otherTasks, ...reordered]));
      }
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-4">Task Management Board</h1>
      <header className="flex flex-wrap justify-between items-center mb-8">
        <div className="w-3/4 mx-auto">
          <div className="bg-blue-400/5 py-4 px-6 rounded mb-4 sm:flex justify-between items-center border-blue-100 border">
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="font-semibold">{user.email}</p>
            <ul className="sm:pl-6 font-semibold">
              {user.numbers?.map((number, index) => (
                <li key={index}>{number}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mb-6 space-x-4 flex justify-end">
        <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Logout
        </button>
        <button onClick={openModal} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          + Add Task
        </button>
      </div>

      <DndContext onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusOptions.map((status) => {
            const tasks = getTasksByStatus(status.value);
            return (
              <DroppableColumn key={status.value} status={status.value}>
                <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <h2 className="font-bold text-lg mb-4 flex justify-between items-center">
                    {status.label}
                    <span className="bg-gray-300 px-2 py-1 rounded-full text-sm">
                      {tasks.length || 0}
                    </span>
                  </h2>
                  <VirtualTaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <DraggableTask task={activeTask} onClick={() => {}} onDelete={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      {taskModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-md p-8 transform transition-all duration-300 ${isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">{editId ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={IsTask.title}
                  onChange={(e) => setIsTask({ ...IsTask, title: e.target.value })}
                  className="w-full p-2 border rounded outline-blue-300"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={IsTask.description}
                  onChange={(e) => setIsTask({ ...IsTask, description: e.target.value })}
                  className="w-full p-2 border rounded outline-blue-300"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">Status</label>
                <div
                  className='w-full p-2 border rounded cursor-pointer bg-white'
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  {IsTask.status}
                </div>
                {statusDropdownOpen && (
                  <ul className='border rounded mt-2'>
                    {statusOptions?.map((option) => (
                      <li
                        key={option.value}
                        onClick={() => {
                          setIsTask({ ...IsTask, status: option.value });
                          setStatusDropdownOpen(false);
                        }}
                        className={`p-2 border-b border-blue-100 cursor-pointer hover:bg-blue-100 ${IsTask.status === option.value ? "bg-blue-200 font-semibold" : ''}`}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  {editId ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
