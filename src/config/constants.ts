// API Configuration
export const API_BASE_URL = 'http://your-api-base-url.com/api';

// Task Categories
export const TASK_CATEGORIES = [
  'Work and Career',
  'Health and Fitness',
  'Personal Development',
  'Family and Relationships',
  'Finance',
  'Recreation and Hobbies',
  'Home and Environment',
  'Other'
];

// Task Priorities
export const TASK_PRIORITIES = [
  'Must',
  'Important',
  'Optional'
];

// Task Types
export const TASK_TYPES = {
  HABIT: 'habit',
  RECURRING: 'recurring',
  TASK: 'task',
  GOAL_OF_THE_DAY: 'goal-of-the-day',
  LONG_TERM: 'long-term',
  DAILY: 'daily',
  CUSTOM: 'custom'
} as const;

// Evaluation Types
export const EVALUATION_TYPES = {
  YES_NO: 'yesno',
  COUNT: 'count',
  TIME: 'time',
  CUSTOM: 'custom'
} as const; 