import { Injectable } from '@angular/core';
import * as hypothetical from './hypothetical';

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
        [{propertyId: 'income', modifier: '+', amount: 20000, enabled: true}]
      )
    );

    this.hypotheticals.push(
      new hypothetical.Hypothetical(
        "Earn 20k Less",
        this.baseline,
        [{propertyId: 'income', modifier: '-', amount: 20000, enabled: true}]
      )
    );

    this.simulateHypotheticals();
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
