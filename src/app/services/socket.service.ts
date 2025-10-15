import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
      providedIn: 'root',
})
export class SocketService {
      private socket: Socket;
      private chatIdSignal = signal<number | null>(null);
      constructor(private auth: AuthService) {
            this.socket = io(environment.socketUrl, {
                  extraHeaders: {
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        'user-type': '1'
                  }
            });
      };

      setChatId(chatId: number | null): void {
            this.chatIdSignal.set(chatId);
      };

      getChatId(): number | null {
            return this.chatIdSignal();
      };

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
            this.socket.emit('fetch_docter_messages', { chatId });
      }

      onChatHistory(): Observable<any> {
            return new Observable((observer) => {
                  this.socket.on('chat_docter_history', (messages) => {
                        observer.next(messages);
                  });
            });
      }

      sendMessage(chatId: string, message: string, messageType: string, files?: any): void {
            this.socket.emit('send_message', {
                  chatId,
                  message,
                  messageType,
                  files
            })
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
      };

      removeAllListeners(): void {
            this.socket.removeAllListeners('chat_list');
            this.socket.removeAllListeners('chat_docter_history');
            this.socket.removeAllListeners('new_message');
      }
}
