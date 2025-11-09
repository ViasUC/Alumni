import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDetalleComponent } from './popup-detalle.component';

describe('PopupDetalleComponent', () => {
  let component: PopupDetalleComponent;
  let fixture: ComponentFixture<PopupDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
