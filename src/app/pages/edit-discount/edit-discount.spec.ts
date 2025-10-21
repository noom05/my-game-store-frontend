import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDiscount } from './edit-discount';

describe('EditDiscount', () => {
  let component: EditDiscount;
  let fixture: ComponentFixture<EditDiscount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDiscount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDiscount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
