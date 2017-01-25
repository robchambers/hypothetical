import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DataModelService } from './data-model.service'
import 'hammerjs';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [DataModelService],
  bootstrap: [AppComponent],
  entryComponents: []
})

export class AppModule { }
