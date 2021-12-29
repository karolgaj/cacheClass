import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'placeholder-component',
  template: `
    <h1>PLACEHOLDER</h1>
    <button [routerLink]="['../', 'data']">go to DATA</button>
  `
})

export class PlaceholderComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
