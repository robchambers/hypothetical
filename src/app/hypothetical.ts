import _ from 'lodash';

export enum MaritalStatusEnum {
    SINGLE, MARRIED, HEAD_OF_HOUSEHOLD
}

export class Baseline {
  constructor(adjustedGrossIncome :number = 50000,
              maritalStatus :MaritalStatusEnum = MaritalStatusEnum.SINGLE) {

  }
}

interface iDelta {
  applyDelta(baselineValue :number) :number;
 }

export class DeltaEquals implements iDelta {
  /**
   * Completely override the value. If 'equals' is undefined, then just return baseline.
   */
  equals :number = undefined;

  applyDelta(baselineValue :number) {
    if ( _.isUndefined(this.equals) ) {
      return baselineValue;
    } else {
      return this.equals;
    }
  }
}

export class DeltaPlusMinus implements iDelta {
  plus: number = 0;

  applyDelta(baselineValue :number) {
    return baselineValue + this.plus;
  }
}

export class DeltaPercent implements iDelta {
  percent: number = 0;

  applyDelta(baselineValue :number) {
    return baselineValue * (100 + this.percent);
  }
}

export class Hypothetical {
  baseline :Baseline;

  delta :iDelta;

}
