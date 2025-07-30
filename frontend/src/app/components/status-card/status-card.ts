import { Component, inject, input, signal } from '@angular/core';
import { TodoStatus } from '../../types';
import { TodoInterface } from '../../interfaces';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-status-card',
  imports: [],
  templateUrl: './status-card.html',
})
export class StatusCard {

  statusItem = input.required<TodoInterface>()
  private sanitizer = inject(DomSanitizer)

  
  protected readonly icons = signal<Record<TodoStatus | "total", string>>({
    total: `
      <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `,

    completed: `
      <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
      </svg>
    `,
    pending: `
      <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path>
      </svg>
    `,
    highPriority: `
      <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"></path>
      </svg>
    `,
  })

  getSanitizedIcon(status: TodoStatus | 'total'): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons()[status]);
  }
}
