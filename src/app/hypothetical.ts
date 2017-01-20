import * as _ from 'lodash';

import Taxee from 'taxee-tax-statistics';

console.log(Taxee);

export enum MaritalStatusEnum {
    SINGLE, MARRIED, MARRIED_SEPARATELY, HEAD_OF_HOUSEHOLD
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
  amount :number,
  description :string,
  detailsHTML? :string
}

export interface iOutcome {
  afterTaxIncome: number,
  charges: Array<iCharge>
}

export class Hypothetical {

  constructor(public baseline: Baseline,
              public delta?: iDelta,
              public outcome: iOutcome = {charges:[], afterTaxIncome:undefined}) {}

  simulateHypothetical() {

    let federal = Taxee['2016'].federal;
    console.log(federal);
    let {deductions, exemptions, income_tax_brackets} = federal.tax_withholding_percentage_method_tables.annual.single;
    console.log(income_tax_brackets)

    let incomeTaxAmount = 0, incomeAccountedFor=0;
    for ( const { amount, bracket, marginal_capital_gain_rate, marginal_rate } of income_tax_brackets) {
      if ( this.baseline.adjustedGrossIncome > amount ) {
        // This is a lower bracket; we pay this tax rate on this slice of income.
        incomeTaxAmount += (amount - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = amount;
      } else {
        // We are in this tax bracket. Apply this rate to the remainder of income.
        incomeTaxAmount += (this.baseline.adjustedGrossIncome - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = this.baseline.adjustedGrossIncome;
        break;
      }
      console.log(`Moving past bracket ${amount} (${incomeTaxAmount})`)
    }
    console.log(`Tax on ${this.baseline.adjustedGrossIncome} is ${incomeTaxAmount}`);

    let charges: Array<iCharge> = [
      {
        amount: incomeTaxAmount,
        description: 'Federal Income Tax'
      }
    ];
    // TODO: really need to subtract charges from actual income.
    this.outcome = {
      charges: charges,
      afterTaxIncome: this.baseline.adjustedGrossIncome - _.sum(_.map(charges, e=>e.amount))
    }

  }

}


