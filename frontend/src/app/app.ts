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
    id: crypto.randomUUID(),
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
      },
      complete: () => {
        this.isSubmitting.set(false);
        this.todoTitle.set("");
      }
    })

  //   const value = (this.todoTitle() ?? "").trim();
  //     this.newTodo.set({
  //       ...this.newTodo(),
  //       value,
  //       id: crypto.randomUUID()
  //     });

  // this.todos.update(todos => {
  //     const newTodos = [...todos, this.newTodo()];
  //     localStorage.setItem('todos', JSON.stringify(newTodos));
  //     return newTodos;
  //   });
  //   this.todoTitle.set("");
  //   this.newTodo.set({
  //     id: crypto.randomUUID(),
  //     value: '',
  //     status: 'active',
  // })
  }

  markAsCompleted(id: string) {
    this.todos.update(todos => {
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          const currentStatus = todo.status;
          if (currentStatus === 'completed') {
            return { ...todo, status: 'active' as TodoInterface['status'] };
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
