import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { TodoInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Todo {
  
  protected host = 'http://localhost:8080/api';
  //  protected host = "/api";
  protected http = inject(HttpClient);
  public   todos = signal<TodoInterface[]>([]);


  public getTodos() {
    return this.http.get<{
      todos: TodoInterface[];
    }>(`${this.host}/todos`)
  }

  public createTodo(todo: string) {
    const formData = new FormData()
    formData.append('value', todo)
    return this.http.post<{
      message: "Todo created successfully"
      todo: TodoInterface;
    }>(`${this.host}/create-todo`, formData)
  }

  public toggleStatus(id: string) {
    return this.http.put<{
      todo: TodoInterface;
    }>(`${this.host}/todos/${id}/toggle`, {})
  }
}
