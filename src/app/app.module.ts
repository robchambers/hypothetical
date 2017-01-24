import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent, DialogNewHypothetical } from './app.component';
import { MaterialModule } from '@angular/material';
import 'hammerjs';

@NgModule({
  declarations: [AppComponent, DialogNewHypothetical],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent, DialogNewHypothetical]
})

export class AppModule { }
