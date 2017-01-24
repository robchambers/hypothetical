import { Component, Optional } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material'
import { DataModelService } from './data-model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataModelService]
})

export class AppComponent {
  title = 'app works!';

  constructor( public dm: DataModelService, private _dialog: MdDialog ) { }

  newHypothetical() {
    let dialogRef = this._dialog.open(DialogNewHypothetical);

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
    });
  }

}

@Component({
  selector: 'new-hypothetical-dialog',
  template: `
<h1 md-dialog-title>New Hypothetical</h1>
<div md-dialog-content>What would you like to do?</div>
<div md-dialog-actions>
  <button md-button (click)="dialogRef.close('Option 1')">Option 1</button>
  <button md-button (click)="dialogRef.close('Option 2')">Option 2</button>
</div>
    <!--<p>This is a dialog</p>-->
    <!--<p>-->
      <!--<label>-->
        <!--This is a text box inside of a dialog.-->
        <!--<input #dialogInput>-->
      <!--</label>-->
    <!--</p>-->
    <!--<p> <button md-button (click)="dialogRef.close(dialogInput.value)">CLOSE</button> </p>-->
  `,
  providers: [DataModelService]
})
export class DialogNewHypothetical {
  constructor(public dialogRef: MdDialogRef<DialogNewHypothetical>) {

  }
}
