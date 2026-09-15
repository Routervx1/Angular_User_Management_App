import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly saved = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    bio: [''],
    avatarUrl: [''],
  });

  constructor() {
    // Sync the form whenever the underlying profile signal changes
    // (e.g. on first load once auth state resolves).
    effect(() => {
      const profile = this.auth.profile();
      if (profile) {
        this.form.setValue(
          {
            fullName: profile.fullName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
          },
          { emitEvent: false },
        );
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.updateProfile(this.form.getRawValue());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
