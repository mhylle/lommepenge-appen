import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, CreateMessage } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_BASE = '/api/app2';

  constructor(private http: HttpClient) { }

  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_BASE}/messages`);
  }

  createMessage(message: CreateMessage): Observable<Message> {
    return this.http.post<Message>(`${this.API_BASE}/messages`, message);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/messages/${id}`);
  }

  getBackendInfo(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/info`);
  }
}
