import { Component, ElementRef, ViewChild } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { LoaderService } from '../../../services/loader.service';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare const ZegoExpressEngine: any;

@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  doctorProfile$!: Observable<DoctorProfileResponse>;
  activeChatDetails: any;
  orgChatList: any[] = [];
  chatlist: any[] = [];
  messageList: any[] = [];
  message: string = '';
  constructor(private socketService: SocketService, private loaderService: LoaderService, private apiService: CommonService) { }

  ngOnInit(): void {
    this.loaderService.show();
    this.doctorProfile$ = this.apiService.get<DoctorProfileResponse>('doctor/get_profile').pipe(tap(() => setTimeout(() => this.loaderService.hide(), 100)));

    // this.socketService.userConnected();
    this.socketService.fetchChats();
    this.socketService.onChatList().subscribe((chats) => {
      this.orgChatList = this.chatlist = chats;
      console.log(this.chatlist);
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
    });
  }

  sendMessage() {
    if (!this.message) return;
    this.socketService.sendMessage(this.activeChatDetails.id, this.message.trim(), 'text');
    this.message = '';
  }
  async startCall() {
    const roomID = 'test@123';
    const userID = '2222';
    const userName = 'user_' + userID;
    const appID = 1602450801;
    const serverSecret = '838170b757bc7b5c7b753a8758a8ae9c';
    const token = '04AAAAAGhWqoYADC1momAoIa0hmVQBsgCvqM9ZseXgBEH6em3773Zv57n78rVW0qkagYWz8cpeoiKeZ6rZjdiX2myr+QAViHS3AuotgPAv2+AX/II8G25jXJmRz1bz7Ea5n2rPHgM4lCaMrEMNJbumtQeJ5ee5eM33VpR+HtKPUvVLNuSxsa5UD4t05bhcM+xxRGZ8PMf+KW2t8R7c4Tkh5pqd2um7aGnWA/FdYXQ31RoSDpLp21zBOmnAh5kBm4ujqGX0kukMlwE='
    // const token = ZegoExpressEngine.generateKitTokenForTest(
    //   appID,
    //   serverSecret,
    //   roomID,
    //   userID,
    //   userName
    // );

    const zg = new ZegoExpressEngine(appID, 'wss://webliveroom37.zegocloud.com/ws');
    // await zg.createEngine();

    await zg.loginRoom(roomID, token, { userID, userName });


    const localStream = await zg.createStream({
      camera: { video: true, audio: true }
    });
    this.localVideo.nativeElement.srcObject = localStream;
    debugger
    const streamID = 'stream_' + userID;
    zg.startPublishingStream(streamID, localStream);


    zg.on('roomStreamUpdate', async (_roomID: string, updateType: string, streamList: any[]) => {
      if (updateType === 'ADD' && streamList.length) {
        const remoteStream = await zg.startPlayingStream(streamList[0].streamID);
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      }
    });
  }

}
