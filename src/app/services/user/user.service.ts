import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { User } from '../../models/observations';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  public getAppUsers(): Observable<User[]> {
    return this.http.get<{data: User[]}>(`${environment.BACKEND_BASE_URL}/admin-panel/users`)
    .pipe(
      map((response) => response.data)
    );
  }

  public getTrashedAppUser(): Observable<User[]> {
    return this.http.get<{data: User[]}>(`${environment.BACKEND_BASE_URL}/admin-panel/users/trashed`)
    .pipe(
      map((response) => response.data)
    );
  }

  public deleteAppUser(user: User): Observable<void> {
    return this.http.delete<void>(`${environment.BACKEND_BASE_URL}/admin-panel/users/${user.id}`);
  }

  public restoreAppUser(user: User): Observable<void> {
    return this.http.patch<void>(`${environment.BACKEND_BASE_URL}/admin-panel/users/restore/${user.id}`, {});
  }
}
