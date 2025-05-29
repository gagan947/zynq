import { Component, effect } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoWhitespaceDirective } from '../../../../validators';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-support-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './support-detail.component.html',
  styleUrl: './support-detail.component.css'
})
export class SupportDetailComponent {
  supportTicket = this.service._supportTicket;
  Form = new FormGroup({
    description: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
  });
  loading: boolean = false;
  constructor(private service: CommonService, public location: Location, public auth: AuthService, private toster: NzMessageService) {
    effect(() => {
      this.supportTicket();
    });
    if (!this.supportTicket()) {
      this.service._supportTicket.set(JSON.parse(sessionStorage.getItem('supportTicket') || ''));
    }
  }

  onSubmit() {
    this.Form.markAllAsTouched();
    if (this.Form.valid) {
      this.loading = true;
      let formData: any = {
        response: this.Form.value.description,
        support_ticket_id: this.supportTicket()?.support_ticket_id
      }
      this.service.post<any, any>('clinic/send-response-to-doctor', formData).subscribe({
        next: (resp) => {
          this.loading = false;
          resp.success ? this.toster.success(resp.message) : this.toster.warning(resp.message);
          if (resp.success) {
            this.location.back();
          }
        },
        error: (err) => {
          this.loading = false;
          this.toster.error(err);
        }
      });
    }
  }
}
