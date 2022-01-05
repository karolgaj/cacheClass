import {Component} from '@angular/core';
import {DataService} from "./data.service";

@Component({
  selector: 'data-component',
  template: `
    <div *ngIf="data$ | async as data">
      <h1>User: {{ data.name.title }} {{ data.name.first }} {{ data.name.last }}</h1>
      <h2>Username: {{data.login.username}}</h2>
      <p>Phone: {{data.phone}}</p>
      <p>Gender: {{data.gender}}</p>
    </div>

    <button (click)="reloadData()">reload data</button>
    <button [routerLink]="'../placeholder'">go to PLACEHOLDER</button>
  `
})

export class DataComponent {
  public data$ = this.dataService.randomUser();
  constructor(private dataService: DataService) {}


  public reloadData(): void {
    // @ts-ignore
    this.dataService.randomUser.reload()
  }
}
