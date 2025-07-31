import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { TodoInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Todo {
  
  protected host = 'http://localhost:8080/api';
  protected http = inject(HttpClient);
  public   todos = signal<TodoInterface[]>([]);


  public getTodos() {
    return this.http.get<{
      todos: TodoInterface[];
    }>(`${this.host}/todos`)
  }
}
