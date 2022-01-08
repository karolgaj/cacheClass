import {Component, OnInit} from '@angular/core';
import {DataService} from "./data.service";

@Component({
  selector: 'placeholder-component',
  template: `
    <h1>PLACEHOLDER</h1>

    <div *ngIf="data$ | async as data">
      <h1>User: {{ data.name.title }} {{ data.name.first }} {{ data.name.last }}</h1>
      <h2>Username: {{data.login.username}}</h2>
      <p>Phone: {{data.phone}}</p>
      <p>Gender: {{data.gender}}</p>

      <button (click)="this.data$.reload()">refresh</button>
    </div>

    <button [routerLink]="['../', 'data']">go to DATA</button>
  `
})

export class PlaceholderComponent implements OnInit {
  public data$ = this.dataService.randomUser();
  constructor(private dataService: DataService) {}

  ngOnInit() {
  }
}
