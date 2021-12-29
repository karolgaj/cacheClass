import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {RouterModule, Routes} from "@angular/router";
import {DataComponent} from "./data.component";
import {PlaceholderComponent} from "./placeholder.component";

const routes: Routes = [
  {path: '', redirectTo: 'placeholder', pathMatch: 'full'},
  {path: 'data', component: DataComponent},
  {path: 'placeholder', component: PlaceholderComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    DataComponent,
    PlaceholderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
