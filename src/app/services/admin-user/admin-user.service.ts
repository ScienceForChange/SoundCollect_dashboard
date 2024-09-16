import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminUser } from '../../models/admin-user';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  constructor(
    private http: HttpClient
  ) { }

  public getAdminUsers(): Observable<AdminUser[]> {
    return this.http.get<{data: AdminUser[]}>(`${environment.BACKEND_BASE_URL}/admin-panel/admin-users`)
    .pipe(
      map((response) => response.data)
    );
  }

  public getAdminUser(id: string): Observable<AdminUser> {
    return this.http.get<{data: AdminUser}>(`${environment.BACKEND_BASE_URL}/admin-panel/admin-users/${id}`)
    .pipe(
      map((response) => response.data)
    );
  }

  public createAdminUser(user: AdminUser): Observable<AdminUser> {
    return this.http.post<{data: AdminUser}>(`${environment.BACKEND_BASE_URL}/admin-panel/admin-users`, user)
    .pipe(
      map((response) => response.data)
    );
  }

  public updateAdminUser(user: AdminUser): Observable<AdminUser> {
    return this.http.patch<{data: AdminUser}>(`${environment.BACKEND_BASE_URL}/admin-panel/admin-users/${user.id}`, user)
    .pipe(
      map((response) => response.data)
    );
  }

  public deleteAdminUser(user: AdminUser): Observable<void> {
    return this.http.delete<void>(`${environment.BACKEND_BASE_URL}/admin-panel/admin-users/${user.id}`);
  }

}
