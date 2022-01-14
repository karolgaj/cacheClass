import { Component } from '@angular/core';
import { ZipCodeService } from '../services/zip-code.service';

@Component({
  selector: 'data-component',
  template: `
    <div *ngIf="data$ | async as data">
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

    <button style="margin-top: 2rem" [routerLink]="'../placeholder'">go to PLACEHOLDER</button>
  `,
})
export class ZipCodeComponent {
  public data$ = this.zipCodeService.jokeByType('54-235');
  public data1$ = this.zipCodeService.jokeByType('58-100');

  constructor(private zipCodeService: ZipCodeService) {}
}
