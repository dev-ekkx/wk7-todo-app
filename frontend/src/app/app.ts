import { Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoList } from "./components/todo-list/todo-list";
import { TodoInterface } from './interfaces';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoList, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected readonly title = signal('frontend');
  protected isValidTodo = signal(false);

  private readonly destroy$ = new Subject<void>() 

  constructor() {
  this.todoTitle.valueChanges.pipe(
    takeUntil(this.destroy$),
  ).subscribe(val => {
      const value = (val ?? "").trim();
      console.log('value', value);
      this.isValidTodo.set(value.length > 2);
      this.newTodo.set({
        ...this.newTodo(),
        value,
        id: crypto.randomUUID()
      });
    })
  }

  todos = signal<TodoInterface[]>(localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')!) : []);

    todoTitle = new FormControl({value: "", disabled: false});


  newTodo = signal<TodoInterface>({
    id: crypto.randomUUID(),
    value: '',
    status: 'pending',
  });


  onSubmit(event: Event) {
    event.preventDefault();
  this.todos.update(todos => {
      const newTodos = [...todos, this.newTodo()];
      localStorage.setItem('todos', JSON.stringify(newTodos));
      return newTodos;
    });
    this.todoTitle.setValue('');
    this.isValidTodo.set(false);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();}
}
