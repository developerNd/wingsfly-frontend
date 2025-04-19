import axios from 'axios';
const API_BASE_URL  = 'http://192.168.1.101:8000/api'

export interface TaskData {
  // Support both old and new field names
  habit?: string;
  task?: string;
  category: string;
  start_date: string;
  end_date: string;
  block_time: {
    start: string;
    end: string;
    duration: number;
  };
  pomodoro_count: number;
  priority: 'Must' | 'Important';
  notes: string;
  is_pending: boolean;
  linked_goal: string;
  type: string;
  evaluation_type: string;
  gender: string;
  status: 'active' | 'completed' | 'archived';
  completion_status: 'pending' | 'completed';
}

export const createTask = async (taskData: TaskData) => {
  try {
    console.log('Creating task with data:', taskData);
    const response = await axios.post(`${API_BASE_URL}/saveDailyPlan`, taskData);
    console.log('Task creation response:', response);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        }
      });
      throw error;
    }
    console.error('Error in createTask:', error);
    throw new Error('Failed to create task');
  }
};

export const getTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskData: Partial<TaskData>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}; 