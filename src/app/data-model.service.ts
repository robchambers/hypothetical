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

  constructor() {
    this.baselineHypothetical = new hypothetical.Hypothetical(this.baseline);

    // for testing
    this.baselineHypothetical.simulateHypothetical();
  }

}
