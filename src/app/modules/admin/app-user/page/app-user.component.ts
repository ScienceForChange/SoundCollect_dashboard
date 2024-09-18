import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-user',
  templateUrl: './app-user.component.html',
  styleUrl: './app-user.component.scss'
})
export class AppUserComponent implements OnInit, OnDestroy {

  activatedRoute:ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);

  private activatedRoute$!: Subscription;
  private router$!: Subscription;

  showTrashedUsers:boolean = false;

  ngOnInit(): void {
    this.activatedRoute$ = this.activatedRoute.firstChild?.data.subscribe(data => {
        this.showTrashedUsers = data['trashedUsers'] ? data['trashedUsers'] : false;
    });
    this.router$ = this.router.events.subscribe((event) => {
      this.activatedRoute$ = this.activatedRoute.firstChild?.data.subscribe(data => {
          if(event instanceof NavigationEnd) {
            this.showTrashedUsers = data['trashedUsers'] ? data['trashedUsers'] : false;
          }
        });
    });
  }

  ngOnDestroy(): void {
    if(this.activatedRoute$) this.activatedRoute$.unsubscribe();
    if(this.router$) this.router$.unsubscribe();
  }

}
