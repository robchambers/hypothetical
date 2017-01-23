import * as _ from 'lodash';

import Taxee from 'taxee-tax-statistics';

console.log(Taxee);

// export enum MaritalStatusEnum {
//     SINGLE, MARRIED, MARRIED_SEPARATELY, HEAD_OF_HOUSEHOLD
// }

export class Baseline {
  constructor(public income :number = 50000,
              public adjustmentsToIncome :number = 0,
              public numberExemptions :number = 1,
              public deductions :number = 6300, // 12600, 9300
              public taxCredits : number =  0,
              public expenses : Array<iExpense> = [
                {name: "Rent", amount: 10000}
              ] ) {
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

export interface iExpense {
  name :string,
  amount :number
}

export interface iOutcome {
  income: number,
  charges: Array<iCharge>,
  netIncome: number
}

export class Hypothetical {

  constructor(public baseline: Baseline = new Baseline(),
              public delta?: iDelta,
              public outcome: iOutcome = {income:null, charges:[], netIncome:null}) {}

  simulateHypothetical() {

    let federal = Taxee['2016'].federal;
    console.log(federal);
    let {deductions, exemptions, income_tax_brackets} = federal.tax_withholding_percentage_method_tables.annual.single;
    console.log(income_tax_brackets)

    let taxableIncome = this.baseline.income;
    console.log(`Starting taxable income, ${taxableIncome}`);

    // ADJUSTMENTS
    taxableIncome = taxableIncome - this.baseline.adjustmentsToIncome;
    console.log(`After adjustments, ${taxableIncome}`);

    // EXEMPTIONS
    let exemption = exemptions[0]
    console.log(`Applying ${exemption.exemption_name}`);
    let exemptionAmt = exemption.exemption_amount * this.baseline.numberExemptions;
    taxableIncome = taxableIncome - exemptionAmt;
    console.log(`After exemptions, ${taxableIncome}`);

    // DEDUCTIONS
    taxableIncome = taxableIncome - this.baseline.deductions;
    console.log(`After Deductions, ${taxableIncome}`);


    let incomeTaxAmount = 0, incomeAccountedFor=0;
    for ( const { amount, bracket, marginal_capital_gain_rate, marginal_rate } of income_tax_brackets) {
      if ( taxableIncome > amount ) {
        // This is a lower bracket; we pay this tax rate on this slice of income.
        incomeTaxAmount += (amount - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = amount;
      } else {
        // We are in this tax bracket. Apply this rate to the remainder of income.
        incomeTaxAmount += (taxableIncome - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = taxableIncome;
        break;
      }
      console.log(`Moving past bracket ${amount} (${incomeTaxAmount})`)
    }
    console.log(`Initial tax on ${taxableIncome} is ${incomeTaxAmount}`);

    incomeTaxAmount = incomeTaxAmount - this.baseline.taxCredits;
    console.log(`After credits, tax is ${incomeTaxAmount}`);


    let charges: Array<iCharge> = [
      {
        amount: incomeTaxAmount,
        description: 'Federal Income Tax'
      }
    ];

    this.outcome = {
      income: this.baseline.income,
      charges: charges,
      netIncome: this.baseline.income - _.sum(_.map(charges, e=>e.amount))
    }
  }
}





// WEBPACK FOOTER //
// ./src/app/hypothetical.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.ts
