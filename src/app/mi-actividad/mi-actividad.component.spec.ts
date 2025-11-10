import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiActividadComponent } from './mi-actividad.component';

describe('MiActividadComponent', () => {
  let component: MiActividadComponent;
  let fixture: ComponentFixture<MiActividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiActividadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
