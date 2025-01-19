import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
  
    const hasMinimumLength = value.length >= 8;
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
  
    const errors: ValidationErrors = {};
    if (!hasMinimumLength) errors.minimumLength = true;
    if (!hasSpecialCharacter) errors.specialCharacter = true;
    if (!hasLetter) errors.letter = true;
    if (!hasNumber) errors.number = true;
  
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
