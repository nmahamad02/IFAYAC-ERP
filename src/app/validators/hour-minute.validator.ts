import { AbstractControl, ValidationErrors } from '@angular/forms';

export function hourMinuteValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (value == null) return null;

  const minutes = Math.round((value % 1) * 100);
  return minutes < 60 ? null : { invalidMinutes: true };
}
