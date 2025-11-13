import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPerfilBasicoComponent } from './popup-perfil-basico.component';

describe('PopupPerfilBasicoComponent', () => {
  let component: PopupPerfilBasicoComponent;
  let fixture: ComponentFixture<PopupPerfilBasicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupPerfilBasicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPerfilBasicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
