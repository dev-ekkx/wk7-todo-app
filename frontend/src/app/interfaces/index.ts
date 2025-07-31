import { TodoStatus } from "../types";

export interface TodoInterface {
    id: string;
    value: string;
    status: TodoStatus;
    created_at?: string;
    updated_at?: string;
}

