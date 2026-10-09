import type { Repository } from 'typeorm';
import { User } from './user.entity.js';
export declare class UsersService {
    private readonly users;
    constructor(users: Repository<User>);
    findById(id: string): Promise<User | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
}
