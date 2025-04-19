export type RootStackParamList = {
  DailyPlan: undefined;
  SelectCategory: {
    taskType: string;
    gender: string;
    isFromAdd: boolean;
    selectedOption?: string;
    isFromDailyPlan?: boolean;
  };
  DailyPlanEvaluation: {
    taskType: string;
    gender: string;
    category: string;
  };
  DailyPlanDefineTask: {
    category: string;
    taskType: string;
    gender: string;
    evaluationType: string;
    selectedOption: string;
  };
  SavedGoals: undefined;
}; 