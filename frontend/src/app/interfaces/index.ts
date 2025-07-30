import { TodoStatus } from "../types";

export interface TodoInterface {
    id: string;
    title: string;
    description: string;
    status: TodoStatus;
    count: number;
}

