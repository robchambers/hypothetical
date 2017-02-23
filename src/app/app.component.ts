import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms'
import { DataModelService } from './data-model.service';
import { ModalDirective } from 'ng2-bootstrap';
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
  statesList = hypothetical.statesList;

  constructor(public dm: DataModelService,
              // private _dialog: MdDialog
  ) {

  }

  mainForm: NgForm;
  @ViewChild('mainForm') currentForm: NgForm;


  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.mainForm) {
      return;
    }
    this.mainForm = this.currentForm;
    if (this.mainForm) {
      this.mainForm.valueChanges
        .subscribe((data?: any) => {
          if (!this.mainForm) { return; }

          if ( this.mainForm.dirty ){
            if ( this.mainForm.valid ) {
              console.log('Resetting form.');
              this.runSimulations();
            } else {
              console.log('Form is dirty but invalid.');
            }
          }
          console.log('Form changed callback.');
        });
    }
  }

  runSimulations() {
    console.log('Running.');
    this.dm.simulateHypotheticals();
    this.mainForm.form.markAsPristine();
    this.mainForm.form.markAsUntouched();
  }


  deleteHypothetical(h) {
    this.dm.hypotheticals = _.filter(this.dm.hypotheticals, g => g !== h);
  }

  // "New Hypothetical" helper properties/fxns
  @ViewChild('newHypotheticalModal') public newHypotheticalModal:ModalDirective;
  toCopyStr: string;
  toCopy: hypothetical.Hypothetical;
  name: string;

  startNewHypothetical() {
    this.toCopyStr = "";
    this.toCopy = undefined;
    this.name = "";
    this.newHypotheticalModal.show();
  }

  newHypothetical() {
    let h = new hypothetical.Hypothetical(this.name, this.dm.baseline);
    if (this.toCopy) {
      h.deltas = _.cloneDeep(this.toCopy.deltas);
      h.state = this.toCopy.state;
    }
    this.dm.hypotheticals.push(h);
    this.newHypotheticalModal.hide();
  }

  toCopyChanged(arg) {
    if (this.toCopyStr) {
      this.toCopy = _.find(this.dm.hypotheticals, h => h.name === this.toCopyStr);
      this.name = "Copy of " + this.toCopy.name;
    } else {
      this.toCopy = undefined;
      this.name = "";
    }
  }
}

// @Component({
//   selector: 'dialog-new-hypothetical',
//   template: `
// <h1 md-dialog-title>New Hypothetical</h1>
// <div md-dialog-content>
// Copy existing hypothetical?
// <select name="name" (change)="toCopyChanged()" [(ngModel)]="toCopyStr">
//   <option [value]="''">No - Start Fresh.</option>
//   <option *ngFor="let h of dm.hypotheticals" [value]="h.name">
//     Copy '{{h.name}}'
//   </option>
// </select><p></p>
// Name: <input type="text" [(ngModel)]="name"/>
// </div>
//
// <div md-dialog-actions>
//   <button md-button (click)="dialogRef.close({name: name, toCopy: toCopy})">Create</button>
//   <button md-button (click)="dialogRef.close()">Cancel</button>
// </div>
//   `,
//   // providers: [DataModelService]
// })
// export class DialogNewHypothetical {
//   toCopyStr: "";
//   toCopy: hypothetical.Hypothetical;
//   name: string = "";
//
//   constructor(public dialogRef: MdDialogRef<DialogNewHypothetical>,  public dm: DataModelService) {
//   }
//
//   toCopyChanged(arg) {
//     if ( this.toCopyStr ) {
//       this.toCopy = _.find(this.dm.hypotheticals, h=>h.name===this.toCopyStr);
//       this.name = "Copy of " + this.toCopy.name;
//     } else {
//       this.toCopy = undefined;
//       this.name = "";
//     }
//   }
// }

