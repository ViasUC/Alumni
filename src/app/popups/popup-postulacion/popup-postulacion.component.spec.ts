import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPostulacionComponent } from './popup-postulacion.component';

describe('PopupPostulacionComponent', () => {
  let component: PopupPostulacionComponent;
  let fixture: ComponentFixture<PopupPostulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupPostulacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPostulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
