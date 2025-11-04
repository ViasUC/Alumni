import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfirmarComponent } from './popup-confirmar.component';

describe('PopupConfirmarComponent', () => {
  let component: PopupConfirmarComponent;
  let fixture: ComponentFixture<PopupConfirmarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupConfirmarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupConfirmarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
