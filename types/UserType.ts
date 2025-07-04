export type Profile = {
    name: string;
    email: string;
    phone: string;
}


export interface UserType {
    expired_at: string;
    profile: Profile
    frontend_path: string[]
}