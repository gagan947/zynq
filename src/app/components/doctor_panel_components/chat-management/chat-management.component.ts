import { Component, effect } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { LoaderService } from '../../../services/loader.service';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { finalize, Observable, skip, Subject, take, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ZegoService } from '../../../services/zego.service';
import { ActivatedRoute } from '@angular/router';


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
  chatId: number | null = null;
  private destroy$ = new Subject<void>();
  hasInitialized: boolean = false;
  constructor(private socketService: SocketService, private loaderService: LoaderService, private apiService: CommonService, public auth: AuthService, private zegoService: ZegoService, private route: ActivatedRoute) {
    effect(() => {
      this.chatId = this.socketService.getChatId();
    })
  }

  ngOnInit(): void {
    this.loaderService.show();
    let apiUrl = 'doctor/get_docter_profile'
    this.doctorProfile$ = this.apiService.get<DoctorProfileResponse>(apiUrl).pipe(finalize(() => this.loaderService.hide()));

    // this.socketService.userConnected();
    this.socketService.fetchChats();
 
    this.socketService.onChatList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((chats) => {
        this.orgChatList = this.chatlist = chats;

        // 👇 Execute only once using the flag
        if (!this.hasInitialized) {
          console.log("going init");
          this.hasInitialized = true; // ✅ flip flag
          if (this.chatId) {
            const chatData = this.orgChatList.filter((item: any) => item.id == this.chatId);
            this.openChat(chatData[0]);
          } else {
           
            this.openChat(this.orgChatList[0]);
          }
        }
      });

    this.socketService.onNewMessage().pipe(takeUntil(this.destroy$)).subscribe(message => {
      if (message.chat_id !== this.activeChatDetails.id) return;
      this.messageList.push(message);
      
    })
  }

  openChat(item: any) {
    this.activeChatDetails = item;
    this.socketService.fetchMessages(item.id);
    this.socketService.onChatHistory().pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      this.messageList = messages;
      
    });
  }

  sendMessage() {
    if (!this.message || this.message.trim().length == 0) return;
    this.socketService.sendMessage(this.activeChatDetails.id, this.message.trim(), 'text');
    this.message = '';
  }
  async startCall() {
    const targetUser = {
      userID: this.activeChatDetails.user_id.replace(/-/g, ''), userName: this.activeChatDetails.full_name,
    };
    // this.zegoService.sendCall(targetUser);
  }

  searchFilter(event: any) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (searchTerm) {
      this.chatlist = this.orgChatList.filter((item: any) => item.full_name.toLowerCase().includes(searchTerm));
    } else {
      this.chatlist = [...this.orgChatList];
    }
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.removeAllListeners(); // remove all socket.on
  }
}
