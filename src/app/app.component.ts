import { Component } from '@angular/core';
import { DataModelService } from './data-model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataModelService]
})

export class AppComponent {
  title = 'app works!';

  constructor( public dm: DataModelService ) { }

}
