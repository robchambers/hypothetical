/**
 * Hypothetical
 * Copyright (C) 2017 Rob Chambers http://www.rdchambers.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

import * as _ from 'lodash';

import Taxee from 'taxee-tax-statistics';

console.log(Taxee);

// export enum MaritalStatusEnum {
//     SINGLE, MARRIED, MARRIED_SEPARATELY, HEAD_OF_HOUSEHOLD
// }

type filingStatuses = "single" | "married" | "married_separately" | "head_of_household";

export class Baseline {
  constructor(public income :number = 50000,
              public filingStatus :filingStatuses = "single",
              public adjustmentsToIncome :number = 0,
              public numberExemptions :number = 1,
              public useStandardDeduction :boolean = true,
              public deductions :number = 0, // 12600, 9300
              public taxCredits : number =  0,
              public expenses : Array<iExpense> = [
                {name: "Rent", amount: 10000}
              ] ) {
  }
}

export interface iDelta {
  propertyId: string,
  modifier: string, // '=', '+', '-', '+ %', '- %'
  amount: number,
  enabled: boolean
}

let deltaFxns = {
  '=': (v1, v2) => v2,
  '+': (v1, v2) => v1 + v2,
  '-': (v1, v2) => v1 - v2,
  '+ %': (v1, v2) => v1 * (100+v2)/100,
  '- %': (v1, v2) => v1 * (100-v2)/100
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

type editorTypes = "dollar" | "percent" | "number" | "filing-status-dropdown";

export interface iPropertyInfo {
  name: string,
  property: string,
  field?: string,
  editor?: editorTypes
}

export class Hypothetical {

  constructor(public name: string = "",
              public baseline: Baseline = new Baseline(),
              public deltas: Array<iDelta> = [],
              public outcome: iOutcome = {income:null, charges:[], netIncome:null}) {}


  availableProperties(): Array<iPropertyInfo> {
    let arrPropertyInfo: Array<iPropertyInfo> = []
    arrPropertyInfo = arrPropertyInfo.concat([
      {name: "Income", property: "income", editor: "dollar"},
      {name: "Filing Status", property: "filingStatus", editor: "filing-status-dropdown"},
      {name: "Adjustments to Income", property: "adjustmentsToIncome", editor: "dollar"},
      {name: "Number of Exemptions", property: "numberExemptions", editor: "number"},
      {name: "Tax Credits", property: "taxCredits", editor: "dollar"},
    ]);

    if ( !this.baseline.useStandardDeduction ) {
      arrPropertyInfo.push({name: "Deductions", property: "deductions", editor: "dollar"});
    }

    arrPropertyInfo = arrPropertyInfo.concat(_.map(this.baseline.expenses, (e): iPropertyInfo =>  {
      return {
        name: "Expense: " + e.name,
        property: 'expenses',
        field: e.name,
        editor: "dollar"
      }
    }));

    return arrPropertyInfo;
  }

  getFilingStatus() {
    return this.baseline.filingStatus;
  }
  /**
   * Get value of propertyId, adjusted according to any applicable Deltas.
   * @param propertyId
   */
  get(name): number {
    // Get the property.
    let baselinePropertyInfo :iPropertyInfo= _.find(this.availableProperties(),x=>(x.name===name)||(x.property===name));
    if (!baselinePropertyInfo){
      throw `Name ${name} not found.`
    }
    name = baselinePropertyInfo.name;

    // Find the value on the baseline model.
    let baselinePropertyValue :number;

    if ( baselinePropertyInfo.property === 'expenses') {
      baselinePropertyValue = _.find(this.baseline.expenses, e=>e.name===baselinePropertyInfo.field).amount;
    } else {
      baselinePropertyValue = this.baseline[baselinePropertyInfo.property];
    }

    // Apply any deltas.
    let adjustedPropertyValue;
    let d = _.find(this.deltas, d=>d.propertyId === name);
    if ( d && d.enabled ) {
      let fxn = deltaFxns[d.modifier];
      return fxn(baselinePropertyValue, d.amount)
    } else {
      return baselinePropertyValue
    }
  }
  simulateHypothetical() {

    let federal = Taxee['2016'].federal;
    console.log(federal);
    let tables = federal.tax_withholding_percentage_method_tables.annual[this.getFilingStatus()];
    let {deductions, exemptions, income_tax_brackets} = tables;
    console.log(income_tax_brackets)

    let taxableIncome = this.get('Income');
    console.log(`Starting taxable income, ${taxableIncome}`);

    // ADJUSTMENTS
    taxableIncome = taxableIncome - this.get('adjustmentsToIncome');
    console.log(`After adjustments, ${taxableIncome}`);

    // EXEMPTIONS
    let exemption = exemptions[0]
    console.log(`Applying ${exemption.exemption_name}`);
    let exemptionAmt = exemption.exemption_amount * this.get('numberExemptions');
    taxableIncome = taxableIncome - exemptionAmt;
    console.log(`After exemptions, ${taxableIncome}`);

    // DEDUCTIONS
    let deduction;
    if ( this.baseline.useStandardDeduction ) {
      deduction = deductions[0].deduction_amount;
      console.log(`Using ${deductions[0].deduction_name}, $${deduction}`);
    } else {
      deduction = this.get('deductions');
    }

    taxableIncome = taxableIncome - deduction;
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

    incomeTaxAmount = incomeTaxAmount - this.get('taxCredits');
    console.log(`After credits, tax is ${incomeTaxAmount}`);


    // Tally it up.
    let charges: Array<iCharge> = [
    ];

    // Income taxes
    charges.push({
      amount: incomeTaxAmount,
      description: 'Federal Income Tax'
    });

    // Expenses
    for ( let expense of this.baseline.expenses ) {
      charges.push({
        description: expense.name,
        amount: this.get('Expense: ' + expense.name)
      });
    }

    this.outcome = {
      income: this.get('Income'),
      charges: charges,
      netIncome: this.get('Income') - _.sum(_.map(charges, e=>e.amount))
    }
  }
}




// WEBPACK FOOTER //
// ./src/app/hypothetical.ts
