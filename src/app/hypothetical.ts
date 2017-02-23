import * as _ from 'lodash';

import Taxee from 'taxee-tax-statistics';

export const y2016 = Taxee['2016'];

// Prepare an object for each state that has info for displaying
//  and calculating taxes.

interface iDeduction {
  "deduction_name": string,
  "deduction_amount": number
}

interface iRate {
  "bracket": number,
  "marginal_rate": number
}

interface iBrackets {
  "specialtaxes"?: Array<any>,
  "deductions"?: Array<iDeduction>,
  "credits"?: Array<any>,
  "annotations"?: Array<any>,
  "income_tax_brackets": Array<iRate>,
  "exemptions": any,
}

interface iState {
  taxeeStr: string,
  displayStr: string,
  taxInfo: {
    head_of_household: iBrackets,
    single: iBrackets,
    married: iBrackets,
    married_separately: iBrackets,
  }
}

let capitalizeEtc= (strSnakeCase) => _.join( _.map(_.split(strSnakeCase, '_'), _.capitalize), ' ');
export let states = {};
for ( let taxeeStr of _.pullAll(_.keys(Taxee['2016']),['federal'])) {
  let displayStr = capitalizeEtc(taxeeStr);
  states[displayStr] = <iState> {
    taxeeStr: taxeeStr,
    displayStr: displayStr,
    taxInfo: Taxee['2016'][taxeeStr]
  };
}
//export const displayToTaxeeHash = {"Alabama":"alabama","Alaska":"alaska","Arizona":"arizona","Arkansas":"arkansas","California":"california","Colorado":"colorado","Connecticut":"connecticut","Delaware":"delaware","District Of Columbia":"district_of_columbia","Florida":"florida","Georgia":"georgia","Hawaii":"hawaii","Idaho":"idaho","Illinois":"illinois","Indiana":"indiana","Iowa":"iowa","Kansas":"kansas","Kentucky":"kentucky","Louisiana":"louisiana","Maine":"maine","Maryland":"maryland","Massachusetts":"massachusetts","Michigan":"michigan","Minnesota":"minnesota","Mississippi":"mississippi","Missouri":"missouri","Montana":"montana","Nebraska":"nebraska","Nevada":"nevada","New Hampshire":"new_hampshire","New Jersey":"new_jersey","New Mexico":"new_mexico","New York":"new_york","North Carolina":"north_carolina","North Dakota":"north_dakota","Ohio":"ohio","Oklahoma":"oklahoma","Oregon":"oregon","Pennsylvania":"pennsylvania","Rhode Island":"rhode_island","South Carolina":"south_carolina","South Dakota":"south_dakota","Tennessee":"tennessee","Texas":"texas","Utah":"utah","Vermont":"vermont","Virginia":"virginia","Washington":"washington","West Virginia":"west_virginia","Wisconsin":"wisconsin","Wyoming":"wyoming"};
//export const stateNames = _.keys(displayToTaxeeHash);

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
              public state : iState = undefined,
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

export interface iPropertyInfo {
  name: string,
  property: string,
  field?: string
}

function calculateStateTaxes(h: Hypothetical, brackets: iBrackets ): iCharge {
  if ( _.isUndefined(brackets) || _.isUndefined(brackets.income_tax_brackets) ) {
    return {
      amount: 0,
      description: 'State Income Tax'
    }
  }

  let {deductions, income_tax_brackets} = brackets;
  if ( !_.isUndefined(brackets.exemptions) ) {
    throw Error('State exemptions not empty...')
  }

  let taxableIncome = h.get('Income');
  console.log(`Starting taxable income, ${taxableIncome}`);

  // ADJUSTMENTS
  taxableIncome = taxableIncome - h.get('adjustmentsToIncome');
  console.log(`After adjustments, ${taxableIncome}`);

  // EXEMPTIONS
  // let exemption = exemptions[0]
  // console.log(`Applying ${exemption.exemption_name}`);
  // let exemptionAmt = exemption.exemption_amount * h.get('numberExemptions');
  // taxableIncome = taxableIncome - exemptionAmt;
  // console.log(`After exemptions, ${taxableIncome}`);

  taxableIncome = taxableIncome - h.get('deductions');
  console.log(`After Deductions, ${taxableIncome}`);

  let incomeTaxAmount = 0, incomeAccountedFor=0;
  for ( const { bracket, marginal_rate} of income_tax_brackets) {
    if ( taxableIncome > bracket ) {
      // This is a lower bracket; we pay this tax rate on this slice of income.
      incomeTaxAmount += (bracket - incomeAccountedFor) * marginal_rate/100;
      incomeAccountedFor = bracket;
    } else {
      // We are in this tax bracket. Apply this rate to the remainder of income.
      incomeTaxAmount += (taxableIncome - incomeAccountedFor) * marginal_rate/100;
      incomeAccountedFor = taxableIncome;
      break;
    }
    console.log(`Moving past bracket ${bracket} (${incomeTaxAmount})`)
  }

  let charge = {
    amount: incomeTaxAmount,
    description: 'State Income Tax'
  }

  return charge;

}
export class Hypothetical {

  constructor(public name: string = "",
              public baseline: Baseline = new Baseline(),
              public deltas: Array<iDelta> = [],
              public state : iState = undefined,
              public outcome: iOutcome = {income:null, charges:[], netIncome:null}) {}


  availableProperties(): Array<iPropertyInfo> {
    let arrPropertyInfo: Array<iPropertyInfo> = []
    arrPropertyInfo = arrPropertyInfo.concat([
      {name: "Income", property: "income"},
      {name: "Adjustments to Income", property: "adjustmentsToIncome"},
      {name: "Number of Exemptions", property: "numberExemptions"},
      {name: "Deductions", property: "deductions"},
      {name: "Tax Credits", property: "taxCredits"},
    ]);
    arrPropertyInfo = arrPropertyInfo.concat(_.map(this.baseline.expenses, e => {
      return {
        name: "Expense: " + e.name,
        property: 'expenses',
        field: e.name
      }
    }));

    return arrPropertyInfo;
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
    let {deductions, exemptions, income_tax_brackets} = federal.tax_withholding_percentage_method_tables.annual.single;
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
    taxableIncome = taxableIncome - this.get('deductions');
    console.log(`After Deductions, ${taxableIncome}`);


    let incomeTaxAmount = 0, incomeAccountedFor=0;
    for ( const { bracket, marginal_capital_gain_rate, marginal_rate } of income_tax_brackets) {
      if ( taxableIncome > bracket ) {
        // This is a lower bracket; we pay this tax rate on this slice of income.
        incomeTaxAmount += (bracket - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = bracket;
      } else {
        // We are in this tax bracket. Apply this rate to the remainder of income.
        incomeTaxAmount += (taxableIncome - incomeAccountedFor) * marginal_rate/100;
        incomeAccountedFor = taxableIncome;
        break;
      }
      console.log(`Moving past bracket ${bracket} (${incomeTaxAmount})`)
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

    let stateIncomeTax: iCharge, state: iState;
    state = this.state || this.baseline.state;
    if ( state ) {
      stateIncomeTax = calculateStateTaxes(this, state.taxInfo.single);
    } else {
      stateIncomeTax = calculateStateTaxes(this, undefined);
    }
    charges.push(stateIncomeTax)

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

    calculateStateTaxes(this, Taxee['2016'].vermont.single)
  }
}

