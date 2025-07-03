import { HttpClient } from '@angular/common/http';
import { Injectable, signal, } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ClinicProfile } from '../models/clinic-profile';
import { Doctor } from '../models/doctors';
import { DoctorProfile } from '../models/doctorProfile';
import { SupportTicket } from '../models/tikets';
@Injectable({
  providedIn: 'root'
})

export class CommonService {

  _clinicProfile = signal<ClinicProfile | null>(null);
  _doctorDetail = signal<Doctor | null>(null);
  _doctorProfile = signal<DoctorProfile | null>(null);
  _soloDoctorProfile = signal<any | null>(null);
  _supportTicket = signal<SupportTicket | null>(null);
  _Appointment = signal<any | null>(null);
  baseUrl = environment.apiUrl

  constructor(private http: HttpClient, private router: Router) { }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.baseUrl + url);
  };

  post<T, U>(url: string, data: U): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, data)
  };

  update<T, U>(url: string, data: U): Observable<T> {
    return this.http.patch<T>(this.baseUrl + url, data)
  };

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.baseUrl + url);
  };
}
