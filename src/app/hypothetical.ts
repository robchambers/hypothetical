import * as _ from 'lodash';

export enum MaritalStatusEnum {
    SINGLE, MARRIED, HEAD_OF_HOUSEHOLD
}



export class Baseline {
  constructor(public adjustedGrossIncome :number = 50000,
              public maritalStatus :MaritalStatusEnum = MaritalStatusEnum.SINGLE) {

  }
}

interface iDelta {
  applyDelta(baselineValue :number) :number;
 }

export class DeltaEquals implements iDelta {
  /**
   * Completely override the value. If 'equals' is undefined, then just return baseline.
   */
  constructor(public equals :number = undefined) { };

  applyDelta(baselineValue :number) {
    debugger;
    if ( typeof this.equals === "undefined" ) {
      return baselineValue;
    } else {
      return this.equals;
    }
  }
}

export class DeltaPlusMinus implements iDelta {
  constructor(public plus :number = 0) { };

  applyDelta(baselineValue :number) {
    return baselineValue + this.plus;
  }
}

export class DeltaPercent implements iDelta {
  constructor(public percent :number = 0) { };

  applyDelta(baselineValue :number) {
    return baselineValue * (100 + this.percent) / 100;
  }
}

export interface iCharge {
  description :string;
  amount :number;
}

export class Outcome {
  charges: Array<iCharge>;
  afterTaxIncome: number;
}

export class Hypothetical {
  baseline :Baseline;

  delta :iDelta;

}

