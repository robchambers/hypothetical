/* tslint:disable:no-unused-variable */

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

});
