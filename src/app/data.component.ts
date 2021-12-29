import {Component, OnDestroy, OnInit} from '@angular/core';
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

export class DataComponent implements OnDestroy {
  public data$ = this.dataService.data$;
  constructor(private dataService: DataService) {}

  ngOnDestroy() {}

  public reloadData(): void {
    this.dataService.reload()
  }
}
