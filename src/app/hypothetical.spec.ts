/* tslint:disable:no-unused-variable */

import *  as hypothetical from './hypothetical.ts';

describe('Hypothetical Classes', () => {
  beforeEach(() => {
  });

  it('should properly handle no delta.', () => {
    let baseline = new hypothetical.Baseline();
    expect(baseline.adjustedGrossIncome).toEqual(50000);
  };

  it('should properly handle equals delta.', () => {
    let baseline = new hypothetical.Baseline();
    let delta = new hypothetical.DeltaEquals();
    expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome);

    let delta = new hypothetical.DeltaEquals(40000);
    expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(40000);
  };

  it('should properly handle plus delta.', () => {
    let baseline = new hypothetical.Baseline();
    let delta = new hypothetical.DeltaPlusMinus(100);
    expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome+100);
  };

  it('should properly handle percent delta.', () => {
    let baseline = new hypothetical.Baseline();
    let delta = new hypothetical.DeltaPercent(50);
    expect(delta.applyDelta(baseline.adjustedGrossIncome)).toEqual(baseline.adjustedGrossIncome*1.5);
  };
});
