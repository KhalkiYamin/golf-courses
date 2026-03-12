export interface Settings {
    id?: number;
    academyName: string;
    academyAddress: string;
    academyEmail: string;
    academyPhone: string;
    academyLogo: string;
    inscriptionActive: boolean;
    autoApproveCoach: boolean;
    sessionDuration: number;
}

export interface ChangePasswordRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
}