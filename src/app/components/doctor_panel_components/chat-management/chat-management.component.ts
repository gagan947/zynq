import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { LoaderService } from '../../../services/loader.service';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { finalize, Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ZegoService } from '../../../services/zego.service';


@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent {
  doctorProfile$!: Observable<DoctorProfileResponse>;
  activeChatDetails: any;
  orgChatList: any[] = [];
  chatlist: any[] = [];
  messageList: any[] = [];
  message: string = '';
  constructor(private socketService: SocketService, private loaderService: LoaderService, private apiService: CommonService, public auth: AuthService, private zegoService: ZegoService) { }

  ngOnInit(): void {
    this.loaderService.show();
    let apiUrl = 'doctor/get_docter_profile'
    this.doctorProfile$ = this.apiService.get<DoctorProfileResponse>(apiUrl).pipe(finalize(() => this.loaderService.hide()));

    // this.socketService.userConnected();
    this.socketService.fetchChats();
    this.socketService.onChatList().subscribe((chats) => {
      this.orgChatList = this.chatlist = chats;
      console.log(44, chats);
    });

    this.socketService.onNewMessage().subscribe(message => {
      this.messageList.push(message);
      console.log(message);
    })
  }

  openChat(item: any) {
    this.activeChatDetails = item;
    this.socketService.fetchMessages(item.id);
    this.socketService.onChatHistory().subscribe((messages) => {
      this.messageList = messages;
      console.log(58, messages);
    });
  }

  sendMessage() {
    if (!this.message) return;
    this.socketService.sendMessage(this.activeChatDetails.id, this.message.trim(), 'text');
    this.message = '';
  }
  async startCall() {
    const targetUser = {
      userID: this.activeChatDetails.user_id.replace(/-/g, ''), userName: this.activeChatDetails.full_name,
    };
    this.zegoService.sendCall(targetUser);
  }
}
