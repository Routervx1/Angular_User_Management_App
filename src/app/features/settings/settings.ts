import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly preferencesSaved = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSaved = signal(false);
  protected readonly showDeleteConfirm = signal(false);

  protected readonly preferencesForm = this.fb.nonNullable.group({
    theme: ['light' as 'light' | 'dark'],
    emailNotifications: [true],
    pushNotifications: [false],
    language: ['en'],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    effect(() => {
      const settings = this.auth.settings();
      if (settings) {
        this.preferencesForm.setValue(settings, { emitEvent: false });
      }
    });
  }

  savePreferences(): void {
    this.auth.updateSettings(this.preferencesForm.getRawValue());
    this.preferencesSaved.set(true);
    setTimeout(() => this.preferencesSaved.set(false), 2500);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordError.set(null);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const result = this.auth.changePassword(currentPassword, newPassword);

    if (!result.ok) {
      this.passwordError.set(result.error);
      return;
    }

    this.passwordForm.reset({ currentPassword: '', newPassword: '' });
    this.passwordSaved.set(true);
    setTimeout(() => this.passwordSaved.set(false), 2500);
  }

  confirmDelete(): void {
    this.auth.deleteAccount();
    this.router.navigate(['/login']);
  }
}
