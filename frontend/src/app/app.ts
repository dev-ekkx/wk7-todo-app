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
  protected statusButtons = signal<TodoStatus[]>(['all', 'active', 'completed']);
  protected todoTitle = signal("");
  protected isLoading = signal(false);
  protected isSubmitting = signal(false);
  protected todos = signal<TodoInterface[]>(this.todosService.todos());
  protected newTodo = signal<TodoInterface>({
    id: "",
    value: '',
    status: 'active',
  });
  
  protected todoList = computed(() => {
    return this.todos().filter(todo => {
      if (this.todoStatus() === 'all') return true;
      return todo.status === this.todoStatus();
    });
  })
  
  protected activeTodosCount = computed(() => {
    return this.todos().filter(todo => todo.status === 'active').length;
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
        console.error('Error fetching todos:', error);
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

  onSubmit(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);

    this.todosService.createTodo(this.todoTitle()).pipe(take(1)).subscribe({
      next: (response) => {
        this.todos.update(todos => {
        return [...todos, response.todo]
      });
      },
      error: (error) => {
        console.error('Error creating todo:', error);
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
        console.error('Error toggling status:', error);
      }
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
