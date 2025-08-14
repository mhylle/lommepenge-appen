import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id?: number;
  content: string;
  author: string;
  createdAt?: string;
}

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.html',
  styleUrls: ['./hello-world.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HelloWorld implements OnInit {
  title = 'Hello World 2';
  message = 'Welcome to App2 - Task Management System';
  
  // Task management properties
  messages: Message[] = [];
  newTask = { content: '', author: 'User' };
  loading = false;
  error = '';
  
  private apiUrl = '/api/app2';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMessages();
  }

  async loadMessages() {
    this.loading = true;
    this.error = '';
    try {
      this.messages = await this.http.get<Message[]>(`${this.apiUrl}/messages`).toPromise() || [];
    } catch (error) {
      this.error = 'Failed to load tasks';
      console.error('Error loading messages:', error);
    } finally {
      this.loading = false;
    }
  }

  async addTask() {
    if (!this.newTask.content.trim()) {
      this.error = 'Please enter a task';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      await this.http.post<Message>(`${this.apiUrl}/messages`, this.newTask).toPromise();
      this.newTask.content = '';
      this.loadMessages(); // Refresh the list
    } catch (error) {
      this.error = 'Failed to add task';
      console.error('Error adding task:', error);
    } finally {
      this.loading = false;
    }
  }

  async deleteTask(id: number) {
    this.loading = true;
    this.error = '';
    try {
      await this.http.delete(`${this.apiUrl}/messages/${id}`).toPromise();
      this.loadMessages(); // Refresh the list
    } catch (error) {
      this.error = 'Failed to delete task';
      console.error('Error deleting task:', error);
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
