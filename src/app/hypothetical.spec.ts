/* tslint:disable:no-unused-variable */

import *  as hypothetical from './hypothetical.ts';

describe('Hypothetical Classes', () => {
  beforeEach(() => {
  });

  // it('should properly handle no delta.', () => {
  //   let baseline = new hypothetical.Baseline();
  //   expect(baseline.adjustedGrossIncome).toEqual(50000);
  // });
  //
  // it('should properly handle equals delta.', () => {
  //   let baseline = new hypothetical.Baseline();
  //   let delta = new hypothetical.DeltaEquals();
  //   expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome);
  //
  //   let delta = new hypothetical.DeltaEquals(40000);
  //   expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(40000);
  // });
  //
  // it('should properly handle plus delta.', () => {
  //   let baseline = new hypothetical.Baseline();
  //   let delta = new hypothetical.DeltaPlusMinus(100);
  //   expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome+100);
  // });
  //
  // it('should properly handle percent delta.', () => {
  //   let baseline = new hypothetical.Baseline();
  //   let delta = new hypothetical.DeltaPercent(50);
  //   expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome*1.5);
  // });

  it('should calculate income taxes from default baseline', () => {
    let h1 = new hypothetical.Hypothetical();
    h1.simulateHypothetical();

    expect(h1.outcome.charges).toBeTruthy();
    expect(h1.outcome.netIncome).toBeLessThan(h1.baseline.income * .9);
    expect(h1.outcome.netIncome).toBeGreaterThan(h1.baseline.income * .5);
  });

  it('should calculate federal income taxes consistently', () => {
    let h1 = new hypothetical.Hypothetical();
    h1.simulateHypothetical();

    let capitalizeEtc= (strSnakeCase) => _.join( _.map(_.split(strSnakeCase, '_'), _.capitalize), ' ');
    let displayToTaxeeHash = {};
    for ( let taxeeStr of _.pullAll(_.keys(hypothetical.y2016),['federal']) {
      let displayStr = capitalizeEtc(taxeeStr)
      displayToTaxeeHash[displayStr] = taxeeStr;
    }
    
    console.log(displayToTaxeeHash);
    
    expect(h1.outcome.charges).toBeTruthy();
    expect(h1.outcome.netIncome).toBeLessThan(h1.baseline.income * .9);
    expect(h1.outcome.netIncome).toBeGreaterThan(h1.baseline.income * .5);
  });
});



// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts


// WEBPACK FOOTER //
// ./src/app/hypothetical.spec.ts