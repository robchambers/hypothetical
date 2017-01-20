/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataModelService } from './data-model.service';

describe('DataModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataModelService]
    });
  });

  it('should ...', inject([DataModelService], (service: DataModelService) => {
    expect(service).toBeTruthy();
  }));
});
