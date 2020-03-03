import { OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { forEachControlIn, TypedFormGroup } from './forms-util';

export class ControlValueAccessorConnector<T> implements OnInit, ControlValueAccessor {
  public form: TypedFormGroup<T>;
  callingOnTouchFromBelow: boolean;
  constructor(@Optional() @Self() private directive: NgControl, form: TypedFormGroup<T>) {
    if (directive) {
      directive.valueAccessor = this;
    }
    this.form = form;
  }

  ngOnInit(): void {
    if (this.directive && this.directive.control) {
      forEachControlIn(this.form)
        .markAsTouchedSimultaneouslyWith(this.directive.control, () => this.callingOnTouchFromBelow)
        .addValidatorsTo(this.directive.control);
    }

    this.form.valueChanges.subscribe(v => this.onChange(v));
    this.form.statusChanges.subscribe(s => {
      if (this.form.touched) {
        this.callingOnTouchFromBelow = true;
        this.onTouch();
        this.callingOnTouchFromBelow = false;
      }
    });
  }

  private onChange = (_: T) => {};
  private onTouch = () => {};
  writeValue(obj: any): void {
    this.form.patchValue(obj || {});
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(disable: boolean) {
    disable ? this.form.disable() : this.form.enable();
    forEachControlIn(this.form).call(disable ? 'disable' : 'enable');
  }
}