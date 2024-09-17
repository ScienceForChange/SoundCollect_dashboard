import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'lodash';
import { Role } from '../../models/admin-user';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor(
    private http : HttpClient
  ) { }

  public getRoles(): Observable<{data:Role[]}> {
    return this.http.get<{ data: Role[] }>(`${environment.BACKEND_BASE_URL}/admin-panel/roles`);
  }

  public getRole(id: string): Observable<{data:Role}> {
    return this.http.get<{ data: Role }>(`${environment.BACKEND_BASE_URL}/admin-panel/roles/${id}`);
  }

  public createRole(role: Role): Observable<{data:Role}> {
    return this.http.post<{ data: Role }>(`${environment.BACKEND_BASE_URL}/admin-panel/roles`, role);
  }

  public updateRole(role: Role): Observable<{data:Role}> {
    return this.http.patch<{ data: Role }>(`${environment.BACKEND_BASE_URL}/admin-panel/roles/${role.id}`, role);
  }

  public deleteRole(role: Role): Observable<void> {
    return this.http.delete<void>(`${environment.BACKEND_BASE_URL}/admin-panel/roles/${role.id}`);
  }

  public getAllPermissions(): Observable<{data: string[]}> {
    return this.http.get<{ data: string[] }>(`${environment.BACKEND_BASE_URL}/admin-panel/permissions`);
  }

}
