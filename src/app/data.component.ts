import {Component} from '@angular/core';
import {CacheableObservable, DataService} from "./data.service";
import {User} from "./data.model";

@Component({
  selector: 'data-component',
  template: `
    <div *ngIf="data$ | async as data">
      <h1>User: {{ data.name.title }} {{ data.name.first }} {{ data.name.last }}</h1>
      <h2>Username: {{data.login.username}}</h2>
      <p>Phone: {{data.phone}}</p>
      <p>Gender: {{data.gender}}</p>

      <button (click)="reload()">refresh</button>
    </div>

    <div *ngIf="data1$ | async as data">
      <h1>User: {{ data.name.title }} {{ data.name.first }} {{ data.name.last }}</h1>
      <h2>Username: {{data.login.username}}</h2>
      <p>Phone: {{data.phone}}</p>
      <p>Gender: {{data.gender}}</p>
      <button (click)="reload1()">refresh</button>
    </div>

    <button style="margin-top: 2rem" [routerLink]="'../placeholder'">go to PLACEHOLDER</button>
  `
})

export class DataComponent {
  public data$: CacheableObservable<User> = this.dataService.randomUser();
  public data1$ = this.dataService.randomUser1();
  constructor(private dataService: DataService) {}

  public reload() {
    this.data$.reload();
  }

  public reload1() {
    this.data1$.reload();
  }
}
