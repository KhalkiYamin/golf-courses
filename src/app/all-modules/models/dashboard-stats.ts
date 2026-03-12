export interface DashboardStats {
    totalUsers: number;
    totalAthletes: number;
    totalCoaches: number;
    pendingCoaches: number;
    totalResources: number;
    totalPayments?: number;
    activityRate?: number;
    activeSubscriptions?: number;
    plannedSessions?: number;
    globalSatisfaction?: number;
}