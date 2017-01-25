import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import { ModalModule } from 'ng2-bootstrap/modal';
import { AppComponent } from './app.component';
import { DataModelService } from './data-model.service'
import 'hammerjs';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AccordionModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [DataModelService],
  bootstrap: [AppComponent],
  entryComponents: []
})

export class AppModule { }
