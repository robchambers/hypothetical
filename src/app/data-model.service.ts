import { Injectable } from '@angular/core';
import * as hypothetical from './hypothetical';
import * as _ from 'lodash';


/**
 * Store input/output data corresonding to a single baseline and associated hypotheticals.
 *
 * Functionality should eventually include:
 *  * Save/load for future.
 */
@Injectable()
export class DataModelService {

  baseline: hypothetical.Baseline = new hypothetical.Baseline();
  baselineHypothetical: hypothetical.Hypothetical;

  hypotheticals: Array<hypothetical.Hypothetical> = [];

  constructor() {

    this.baselineHypothetical = new hypothetical.Hypothetical(
      "Baseline",
      this.baseline
    );


    // for testing
    this.hypotheticals.push(
      new hypothetical.Hypothetical(
        "Earn 20k More",
        this.baseline,
        [{propertyId: 'Income', modifier: '+', amount: 20000, enabled: true}]
      )
    );

    this.hypotheticals.push(
      new hypothetical.Hypothetical(
        "Earn 20k Less",
        this.baseline,
        [{propertyId: 'Income', modifier: '-', amount: 20000, enabled: true}]
      )
    );

    this.simulateHypotheticals();
  }

  expenseNameChange(expense: hypothetical.iExpense, newName: string) {
    let oldName = expense.name;
    for ( let e of this.baseline.expenses ) {
      if ( e.name === newName ) {
        console.log(`Name ${newName} already exists.`);
        return
      }
    }
    // Adjust name in any deltas that reference this expense.
    for ( let h of this.hypotheticals ) {
      for ( let d of h.deltas ) {
        if ( d.propertyId === ("Expense: " + oldName) ) {
          d.propertyId = "Expense: " + newName;
          //console.log(`Updated property name ${oldName} -> ${newName} for ${h.name}.`);
        }
      }
    }
    expense.name = newName;
  }

  deleteExpense(expense: hypothetical.iExpense) {
    // Delete any deltas that reference this expense.
    for ( let h of this.hypotheticals ) {
      for ( let d of h.deltas ) {
        if ( d.propertyId === ("Expense: " + expense.name) ) {
          _.pull(h.deltas, d)
        }
      }
    }
    // And delete the expense.
    _.pull(this.baseline.expenses, expense)
  }

  allHypotheticals() :Array<hypothetical.Hypothetical> {
    return [this.baselineHypothetical].concat(this.hypotheticals);
  }

  simulateHypotheticals() {
    for ( let h of this.allHypotheticals() ) {
      h.simulateHypothetical();
    }
  }

}
