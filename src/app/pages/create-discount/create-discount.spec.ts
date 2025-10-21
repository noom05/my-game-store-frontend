import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDiscount } from './create-discount';

describe('CreateDiscount', () => {
  let component: CreateDiscount;
  let fixture: ComponentFixture<CreateDiscount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDiscount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDiscount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
