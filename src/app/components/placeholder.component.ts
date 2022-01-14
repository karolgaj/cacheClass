import { Component, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { ZipCodeService } from '../services/zip-code.service';

@Component({
  selector: 'placeholder-component',
  template: `
    <h1>PLACEHOLDER</h1>

    <div *ngIf="data$ | async as data">
      <h1>User: {{ data.name.title }} {{ data.name.first }} {{ data.name.last }}</h1>
      <h2>Username: {{ data.login.username }}</h2>
      <p>Phone: {{ data.phone }}</p>
      <p>Gender: {{ data.gender }}</p>

      <button (click)="this.data$.reload()">refresh</button>
    </div>

    <div *ngIf="data1$ | async as data">
      <h1>Country: {{ data.country }}</h1>
      <h2>Postal Code: {{ data['post code'] }}</h2>
      <div>
        <h3>Places:</h3>
        <ng-container *ngFor="let place of data.places">
          <p>State: {{ place.state }}</p>
          <p>Place name: {{ place['place name'] }}</p>
        </ng-container>
      </div>
    </div>

    <button [routerLink]="['../', 'data']">go to DATA</button>
    <button [routerLink]="['../', 'zipCode']">go to zipCode</button>
  `,
})
export class PlaceholderComponent implements OnDestroy {
  public data$ = this.dataService.randomUser();
  public data1$ = this.zipCodeService.jokeByType('54-235');

  constructor(private dataService: DataService, private zipCodeService: ZipCodeService) {}

  ngOnDestroy() {
    // for (let value of REGISTRY_MAP.values()){
    //   value?.clear();
    //   console.log(value);
    // }
  }
}
