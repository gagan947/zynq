import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
      providedIn: 'root',
})
export class SocketService {
      private socket: Socket;

      constructor(private auth: AuthService) {
            this.socket = io(environment.socketUrl, {
                  extraHeaders: {
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        'user-type': '1'

                  }
            });
      }

      userConnected(): void {
            this.socket.emit('user_connected');
      }

      fetchChats(): void {
            this.socket.emit('fetch_chats');
      }

      onChatList(): Observable<any> {
            return new Observable((observer) => {
                  this.socket.on('chat_list', (data) => {
                        observer.next(data);
                  });
            });
      }

      fetchMessages(chatId: string): void {
            this.socket.emit('fetch_messages', { chatId });
      }

      onChatHistory(): Observable<any> {
            return new Observable((observer) => {
                  this.socket.on('chat_history', (messages) => {
                        observer.next(messages);
                  });
            });
      }

      sendMessage(chatId: string, message: string, messageType: string): void {
            this.socket.emit('send_message', {
                  chatId,
                  message,
                  messageType,
            });
      }

      onNewMessage(): Observable<any> {
            return new Observable((observer) => {
                  this.socket.on('new_message', (message) => {
                        observer.next(message);
                  });
            });
      }

      onChatListUpdate(): Observable<any> {
            return new Observable((observer) => {
                  this.socket.on('chat_list', (chats) => {
                        observer.next(chats);
                  });
            });
      }

      disconnect(): void {
            this.socket.disconnect();
      }
}
