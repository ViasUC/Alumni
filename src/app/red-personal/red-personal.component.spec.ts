import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedPersonalComponent } from './red-personal.component';

describe('RedPersonalComponent', () => {
  let component: RedPersonalComponent;
  let fixture: ComponentFixture<RedPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
