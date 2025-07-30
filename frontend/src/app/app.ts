import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoList } from "./components/todo-list/todo-list";
import { StatusCard } from "./components/status-card/status-card";
import { TodoInterface } from './interfaces';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoList, StatusCard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  todos = signal([]);


  todoStatuses = signal<TodoInterface[]>([
    {
  id: '',
    title: '',
    description: '',
    status: 'total',
    count: 10,
    },
    {
      id: '',
      title: '',
      description: '',
      status: 'completed',
      count: 5,
    },
    {
      id: '',
      title: '',
      description: '',
      status: 'pending',
      count: 3,
    },
    {
      id: '',
      title: '',
      description: '',
      status: 'highPriority',
      count: 2,
    },
  ])

  getCompletedCount() {
    return 0
  }

  getPendingCount() {
    return 0
  }

getHighPriorityCount() {
    return 0
  }
}
