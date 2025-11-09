import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPerfilPostulanteComponent } from './popup-perfil-postulante.component';

describe('PopupPerfilPostulanteComponent', () => {
  let component: PopupPerfilPostulanteComponent;
  let fixture: ComponentFixture<PopupPerfilPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupPerfilPostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPerfilPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
