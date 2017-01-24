import { Component, Optional } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material'
import { DataModelService } from './data-model.service';
import * as hypothetical from './hypothetical';
import * as _ from 'lodash';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: []//DataModelService]
})

export class AppComponent {
  title = 'app works!';
  _ = _;  // To use Lodash in template.

  constructor( public dm: DataModelService, private _dialog: MdDialog ) {

  }

  newHypothetical() {
    let dialogRef = this._dialog.open(DialogNewHypothetical);
    let dm = this.dm;
    dialogRef.afterClosed().subscribe(result => {
        let h = new hypothetical.Hypothetical(result.name, dm.baseline);
        if (result.toCopy) {
          h.deltas = _.cloneDeep(result.toCopy.deltas);
        }
        dm.hypotheticals.push(h);
      }
    );
  }

  deleteHypothetical(h) {
    this.dm.hypotheticals = _.filter(this.dm.hypotheticals, g=>g!==h);
  }
}

@Component({
  selector: 'dialog-new-hypothetical',
  template: `
<h1 md-dialog-title>New Hypothetical</h1>
<div md-dialog-content>
Copy existing hypothetical?
<select name="name" (change)="toCopyChanged()" [(ngModel)]="toCopyStr">
  <option [value]="''">No - Start Fresh.</option>
  <option *ngFor="let h of dm.hypotheticals" [value]="h.name">
    Copy '{{h.name}}'
  </option>
</select><p></p>
Name: <input type="text" [(ngModel)]="name"/>
</div>
                    
<div md-dialog-actions>
  <button md-button (click)="dialogRef.close({name: name, toCopy: toCopy})">Create</button>
  <button md-button (click)="dialogRef.close()">Cancel</button>
</div>
  `,
  // providers: [DataModelService]
})
export class DialogNewHypothetical {
  toCopyStr: "";
  toCopy: hypothetical.Hypothetical;
  name: string = "";

  constructor(public dialogRef: MdDialogRef<DialogNewHypothetical>,  public dm: DataModelService) {
  }

  toCopyChanged(arg) {
    if ( this.toCopyStr ) {
      this.toCopy = _.find(this.dm.hypotheticals, h=>h.name===this.toCopyStr);
      this.name = "Copy of " + this.toCopy.name;
    } else {
      this.toCopy = undefined;
      this.name = "";
    }
  }
}
