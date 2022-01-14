import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './components/app.component';
import { DataComponent } from './components/data.component';
import { PlaceholderComponent } from './components/placeholder.component';
import { ZipCodeComponent } from './components/zip-code.component';

const routes: Routes = [
  { path: '', redirectTo: 'placeholder', pathMatch: 'full' },
  { path: 'data', component: DataComponent },
  { path: 'placeholder', component: PlaceholderComponent },
  { path: 'zipCode', component: ZipCodeComponent },
];

@NgModule({
  declarations: [AppComponent, DataComponent, PlaceholderComponent, ZipCodeComponent],
  imports: [BrowserModule, CommonModule, HttpClientModule, RouterModule.forRoot(routes)],
  bootstrap: [AppComponent],
})
export class AppModule {}
