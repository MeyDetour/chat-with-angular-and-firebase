import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDiscussionComponent } from './new-discussion.component';

describe('NewDiscussionComponent', () => {
  let component: NewDiscussionComponent;
  let fixture: ComponentFixture<NewDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDiscussionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
