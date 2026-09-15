# UserApp (Angular 22)

A standalone-components, zoneless, signals-based Angular 22 app with login,
registration, profile, and settings screens.

## Stack notes

- **Standalone components** throughout — no NgModules.
- **Zoneless change detection** (`provideZonelessChangeDetection`) with
  `ChangeDetectionStrategy.OnPush` on every component, per Angular 22 defaults.
- **New control-flow syntax** (`@if` / `@else`) in templates instead of
  `*ngIf`.
- **Signals** for all reactive state (`AuthService` exposes `profile`,
  `settings`, and `isAuthenticated` as signals/computed signals).
- **Functional route guards** (`authGuard`, `guestGuard`) and a functional
  HTTP interceptor.
- **Lazy-loaded routes** via `loadComponent`.
- Reactive Forms (`ReactiveFormsModule`) for login/register/profile/settings,
  including a custom cross-field validator for password confirmation.

## Auth model (demo only)

`AuthService` simulates a backend using `localStorage`:

- `register()` / `login()` / `logout()`
- `updateProfile()` / `updateSettings()`
- `changePassword()` / `deleteAccount()`

This is meant to make the app runnable with zero backend setup. **Before
shipping to production**, replace the internals of `AuthService` with
`HttpClient` calls to a real API, move password hashing server-side, and
issue a proper session/JWT instead of storing the plain email as the
"session token."

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:4200.

## Project structure

```
src/app/
  core/
    guards/       # authGuard, guestGuard
    models/       # UserProfile, UserSettings, etc.
    services/     # AuthService, auth-interceptor
  features/
    auth/
      login/
      register/
    profile/
    settings/
  shared/
    components/
      navbar/
```
