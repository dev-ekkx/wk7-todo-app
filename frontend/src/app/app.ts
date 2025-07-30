import { Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoList } from "./components/todo-list/todo-list";
import { TodoInterface } from './interfaces';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { TodoStatus } from './types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoList, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  private readonly destroy$ = new Subject<void>() 
  protected readonly title = signal('frontend');
  protected todoStatus = signal<TodoStatus>(localStorage.getItem('todoStatus') as TodoStatus || 'all');
  protected statusButtons = signal<TodoStatus[]>(['all', 'pending', 'completed']);
  protected todoTitle = signal("");
  protected todos = signal<TodoInterface[]>(localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')!) : []);
  protected newTodo = signal<TodoInterface>({
    id: crypto.randomUUID(),
    value: '',
    status: 'pending',
  });
  
  protected todoList = computed(() => {
    return this.todos().filter(todo => {
      if (this.todoStatus() === 'all') return true;
      return todo.status === this.todoStatus();
    });
  })
  
  protected activeTodosCount = computed(() => {
    return this.todos().filter(todo => todo.status === 'pending').length;
  });
  
  constructor() {
          effect(() => {
            if (!this.todoList().length) {
              this.todoStatus.set('all');
            }
          })
        }
        protected isValidTodo = computed(() => {
          const value = (this.todoTitle() ?? "").trim();
          return value.length > 2;
        });

  onSubmit(event: Event) {
    event.preventDefault();


          const value = (this.todoTitle() ?? "").trim();
      this.newTodo.set({
        ...this.newTodo(),
        value,
        id: crypto.randomUUID()
      });

  this.todos.update(todos => {
      const newTodos = [...todos, this.newTodo()];
      localStorage.setItem('todos', JSON.stringify(newTodos));
      return newTodos;
    });
    // this.todoTitle.setValue('');
    this.todoTitle.set(" ");
    this.newTodo.set({
      id: crypto.randomUUID(),
      value: '',
      status: 'pending',
  })
  }

  markAsCompleted(id: string) {
    this.todos.update(todos => {
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          const currentStatus = todo.status;
          if (currentStatus === 'completed') {
            return { ...todo, status: 'pending' as TodoInterface['status'] };
          }
          return { ...todo, status: 'completed' as TodoInterface['status'] };
        }
        return todo;
      });
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  }

  updateTodo(id: string) {
    this.todos.update(todos => {
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, value: todo.value.trim() };
        }
        return todo;
      });
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  }

  clearCompleted() {
    this.todos.update(todos => {
    localStorage.setItem('todos', JSON.stringify(this.todos()));
      return todos.filter(todo => todo.status !== 'completed');
    });
  }

  updateTodoStatus(status: TodoStatus) {
    this.todoStatus.set(status);
localStorage.setItem('todoStatus', status);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();}
}
