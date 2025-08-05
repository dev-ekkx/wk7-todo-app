import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoInterface } from './interfaces';
import { FormsModule } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { TodoStatus } from './types';
import { Todo } from './services/todo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>() 
  protected todosService = inject(Todo);
  protected todoStatus = signal<TodoStatus>(localStorage.getItem('todoStatus') as TodoStatus || 'all');
  protected statusButtons = signal<TodoStatus[]>(['all', 'pending', 'completed']);
  protected todoTitle = signal("");
  protected previousValue = signal("");
  protected isLoading = signal(false);
  protected isSubmitting = signal(false);
  protected todos = signal<TodoInterface[]>(this.todosService.todos());
  protected newTodo = signal<TodoInterface>({
    id: "",
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
    return this.todos().filter(todo => todo.status !== 'completed').length;
  });

  protected completedTodosCount = computed(() => {
    return this.todos().filter(todo => todo.status === 'completed').length;
  });
  
  constructor() {
          effect(() => {
            if (!this.todoList().length) {
              this.todoStatus.set('all');
            }
          })
  }

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.isLoading.set(true);
    this.todosService.getTodos().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.todos.set(response.todos);
        localStorage.setItem('todos', JSON.stringify(response.todos));
      },
      error: (error) => {
        alert('Error fetching todos: ' + error);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
  


        protected isValidTodo = computed(() => {
          const value = (this.todoTitle() ?? "").trim();
          return value.length > 2;
        });

  createTodo(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);

    this.todosService.createTodo(this.todoTitle()).pipe(take(1)).subscribe({
      next: (response) => {
        this.todos.update(todos => {
        return [...todos, response.todo]
      });
      },
      error: (error) => {
        alert('Error creating todo: ' + error);
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
        this.todoTitle.set("");
      }
    })
  }

  toggleStatus(id: string) {
    this.todosService.toggleStatus(id).pipe(take(1)).subscribe({
      next: (response) => {
        this.todos.update(todos => {
          return todos.map(todo => {
            if (todo.id === id) {
              return response.todo;
            }
            return todo;
          });
        });
      },
      error: (error) => {
        alert('Error toggling status: ' + error);
      }
    });

  }


  updateTodo(id: string) {
    const todoToUpdate = this.todos().find(todo => todo.id === id);
    if (!todoToUpdate || this.previousValue().trim() === todoToUpdate.value.trim() ) return;
    this.todosService.updateTodo(id, todoToUpdate.value.trim()).pipe(take(1)).subscribe({
      next: (response) => {
        this.todos.update(todos => {
          return todos.map(todo => {
            if (todo.id === id) {
              return response.todo;
            }
            return todo;
          });
        })
      },
      error: (error) => {
        alert('Error updating todo: ' + error);
      }
    })
  }

  clearCompleted() {
    alert('Are you sure you want to clear completed todos?');
    this.todosService.clearCompleted().pipe(take(1)).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadTodos()
      },
      error: (error) => {
        alert('Error clearing completed todos: ' + error);
      }
    })
  }

  updateTodoStatus(status: TodoStatus) {
    this.todoStatus.set(status);
localStorage.setItem('todoStatus', status);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();}
}
