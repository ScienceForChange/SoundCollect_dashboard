import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor(
    private http : HttpClient
  ) { }

  public getRoles(): Observable<{data:string[]}> {
    return this.http.get<{ data: string[] }>(`${environment.BACKEND_BASE_URL}/admin-panel/roles`);    
  }

  
}
