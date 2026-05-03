export type User = {
    id: string;
    avatar: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
};
