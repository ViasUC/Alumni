import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelListaComponent } from './panel-lista.component';

describe('PanelListaComponent', () => {
  let component: PanelListaComponent;
  let fixture: ComponentFixture<PanelListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
