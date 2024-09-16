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


}
