import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPostulanteComponent } from './popup-postulante.component';

describe('PopupPostulanteComponent', () => {
  let component: PopupPostulanteComponent;
  let fixture: ComponentFixture<PopupPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupPostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
