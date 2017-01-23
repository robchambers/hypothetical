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
  propertyId: string,
  modifier: string, // '=', '+', '-', '+ %', '- %'
  amount: number,
  enabled: boolean
 }

export interface iCharge {
  description :string,
  amount :number,
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
              public deltas: Array<iDelta> = [],
              public outcome: iOutcome = {income:null, charges:[], netIncome:null}) {}


  availableProperties() {
    return {
      income: { name: "Income", property: "income"}
    }
  }
  /**
   * Get value of propertyId, adjusted according to any applicable Deltas.
   * @param propertyId
   */
  get(propertyId): number {
    // Get the property.
    let baselinePropertyInfo :any= this.availableProperties()[propertyId];
    let baselinePropertyValue :number = this.baseline[baselinePropertyInfo.property];

    // Apply any deltas.
    return baselinePropertyValue;
  }
  simulateHypothetical() {

    let federal = Taxee['2016'].federal;
    console.log(federal);
    let {deductions, exemptions, income_tax_brackets} = federal.tax_withholding_percentage_method_tables.annual.single;
    console.log(income_tax_brackets)

    let taxableIncome = this.get('income');
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


    // Tally it up.
    let charges: Array<iCharge> = [
    ];

    // Income taxes
    charges.push({
        amount: incomeTaxAmount,
        description: 'Federal Income Tax'
      });

    for ( let expense of this.baseline.expenses ) {
      charges.push({
        description: expense.name,
        amount: expense.amount
      });
    }

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
