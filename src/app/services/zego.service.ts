import { Injectable } from '@angular/core';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZIM } from 'zego-zim-web';
import { CommonService } from './common.service';


@Injectable({
      providedIn: 'root'
})
export class ZegoService {
      private zegoInstance: any;

      constructor(private service: CommonService) { }

      initializeZego(appID: number, serverSecret: string, userID: string, userName: string) {
            const roomID = 'default_room';

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                  appID,
                  serverSecret,
                  roomID,
                  userID,
                  userName
            );

            this.zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

            this.zegoInstance.addPlugins({ ZIM });

            this.zegoInstance.setLanguage("en-US");

            this.zegoInstance.setCallInvitationConfig({
                  enableNotifyWhenAppRunningInBackgroundOrQuit: true,
            });

            console.log('Zego initialized for user:', userName);
      }

      async sendCall(targetUser: any) {
            if (!this.zegoInstance) {
                  console.warn('Zego is not initialized');
                  return;
            }

            try {
                  const res = await this.zegoInstance.sendCallInvitation({
                        callees: [targetUser],
                        callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
                        timeout: 30,
                  });
                  console.log('Call result:', res);
            } catch (err) {
                  console.error('Error sending call:', err);
            }

            this.zegoInstance.setCallInvitationConfig({
                  onOutgoingCallAccepted: async (callID: string, callee: any) => {
                        await this.createCallLogAPI({ callStatus: "completed", callID, receiverId: callee.id });
                  },

                  onOutgoingCallDeclined: async (callID: string, callee: any) => {
                        await this.createCallLogAPI({ callStatus: "rejected", callID, receiverId: callee.id });
                  },

                  onOutgoingCallTimeout: async (callID: string, callee: any) => {
                        debugger
                        await this.createCallLogAPI({ callStatus: "missed", callID, receiverId: callee.id });
                  },

                  onOutgoingCallSent: async (callID: string, callee: any[]) => {
                        const receiverId = callee[0]?.id;
                        await this.createCallLogAPI({ callStatus: "missed", callID, receiverId: receiverId });
                  }
            });
      }

      async createCallLogAPI(data: any) {
            debugger
            let formData = {
                  call_id: data.callID,
                  receiver_user_id: data.receiverId,
                  status: data.callStatus,
                  started_at: new Date(),
            }
            this.service.post('doctor/create-call-log-doctor', data).subscribe();
      }
}
