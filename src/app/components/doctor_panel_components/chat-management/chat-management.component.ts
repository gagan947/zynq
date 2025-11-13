import { Component, effect } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { LoaderService } from '../../../services/loader.service';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzImageModule } from 'ng-zorro-antd/image';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NzImageModule, TranslateModule],
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
  uploading: boolean = false;
  constructor(private socketService: SocketService, private loaderService: LoaderService, private apiService: CommonService, public auth: AuthService, private toastService: NzMessageService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
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
        if (!this.hasInitialized) {
          this.hasInitialized = true;
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

    if (this.files.length > 0) {
      let formData = new FormData()
      if (this.files && this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
          formData.append('files', this.files[i]);
        }
      }
      this.uploading = true
      this.apiService.post('api/upload-files', formData).subscribe((res: any) => {
        if (res.success) {
          this.socketService.sendMessage(this.activeChatDetails.id, this.message.trim(), 'image', res.data);
          this.message = '';
          this.previewFiles = [];
          this.files = [];
          this.uploading = false
        } else {
          this.uploading = false
        }
      })
    } else {
      if (!this.message || this.message.trim().length == 0) return;
      this.socketService.sendMessage(this.activeChatDetails.id, this.message.trim(), 'text');
      this.message = '';
    }
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
      this.chatlist = this.orgChatList.filter((item) => item.full_name?.toLowerCase().includes(searchTerm));
    } else {
      this.chatlist = [...this.orgChatList];
    }
  };


  files: any[] = [];
  previewFiles: { name: string; type: string; url: string }[] = [];

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const maxFiles = 5;
      const selectedFiles = Array.from(input.files);
      if (selectedFiles.length > maxFiles) {
        this.toastService.error(`You can only select up to ${maxFiles} images.`);
        input.value = '';
        return;
      }

      Array.from(input.files).forEach((file) => {
        this.files.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewFiles.push({
            name: file.name,
            type: file.type,
            url: e.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeFile(fileToRemove: any): void {
    const index = this.previewFiles.indexOf(fileToRemove);
    if (index > -1) {
      this.previewFiles.splice(index, 1);
      this.files.splice(index, 1);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.removeAllListeners(); // remove all socket.on
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.message.trim() && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
