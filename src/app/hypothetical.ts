export enum MaritalStatusEnum {
    SINGLE, MARRIED, HEAD_OF_HOUSEHOLD
}

export class Baseline {
  adjustedGrossIncome :number = 50000;
  maritalStatus :MaritalStatusEnum = MaritalStatusEnum.SINGLE;

}

interface iDelta {
  applyDelta(baselineValue :number) :number;
 }

export class DeltaEquals implements iDelta {
  /**
   * Completely overide the value. If 'equals' is undefined, then just return baseline.
   */
  equals :number = undefined;
}

export class DeltaPlusMinus implements iDelta {
  plus: number = 0;
}

export class DeltaAdjustPercent implements iDelta {
  percent: number = 0;
}

export class Hypothetical {
  baseline :Baseline;

  delta :Delta;

}
