import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedClinicsComponent } from './linked-clinics.component';

describe('LinkedClinicsComponent', () => {
  let component: LinkedClinicsComponent;
  let fixture: ComponentFixture<LinkedClinicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedClinicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkedClinicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
