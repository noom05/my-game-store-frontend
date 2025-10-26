import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountList } from './discount-list';

describe('DiscountList', () => {
  let component: DiscountList;
  let fixture: ComponentFixture<DiscountList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
