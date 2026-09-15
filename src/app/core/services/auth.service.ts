import { Injectable, computed, signal } from '@angular/core';
import {
  LoginPayload,
  RegisterPayload,
  StoredAccount,
  UserProfile,
  UserSettings,
} from '../models/user.model';

const ACCOUNTS_KEY = 'userapp.accounts';
const SESSION_KEY = 'userapp.session';

/**
 * Demo-only auth service. It persists accounts in localStorage and simulates
 * a backend + token session. In a real application, replace the internals of
 * login/register/updateProfile/updateSettings with HttpClient calls to your
 * API, and never hash or store passwords on the client.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accounts = signal<Record<string, StoredAccount>>(this.loadAccounts());
  private readonly currentEmail = signal<string | null>(localStorage.getItem(SESSION_KEY));

  /** The signed-in user's profile, or null when logged out. */
  readonly profile = computed<UserProfile | null>(() => {
    const email = this.currentEmail();
    if (!email) return null;
    return this.accounts()[email]?.profile ?? null;
  });

  /** The signed-in user's settings, or null when logged out. */
  readonly settings = computed<UserSettings | null>(() => {
    const email = this.currentEmail();
    if (!email) return null;
    return this.accounts()[email]?.settings ?? null;
  });

  readonly isAuthenticated = computed(() => this.profile() !== null);

  register(payload: RegisterPayload): { ok: true } | { ok: false; error: string } {
    const email = payload.email.trim().toLowerCase();
    const accounts = this.accounts();

    if (accounts[email]) {
      return { ok: false, error: 'An account with that email already exists.' };
    }

    const now = new Date().toISOString();
    const account: StoredAccount = {
      profile: {
        id: crypto.randomUUID(),
        email,
        fullName: payload.fullName.trim(),
        bio: '',
        avatarUrl: '',
        createdAt: now,
      },
      passwordHash: this.hash(payload.password),
      settings: {
        theme: 'light',
        emailNotifications: true,
        pushNotifications: false,
        language: 'en',
      },
    };

    const next = { ...accounts, [email]: account };
    this.accounts.set(next);
    this.persistAccounts(next);
    this.startSession(email);
    return { ok: true };
  }

  login(payload: LoginPayload): { ok: true } | { ok: false; error: string } {
    const email = payload.email.trim().toLowerCase();
    const account = this.accounts()[email];

    if (!account || account.passwordHash !== this.hash(payload.password)) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    this.startSession(email);
    return { ok: true };
  }

  logout(): void {
    this.currentEmail.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  updateProfile(changes: Partial<Pick<UserProfile, 'fullName' | 'bio' | 'avatarUrl'>>): void {
    const email = this.currentEmail();
    if (!email) return;

    const accounts = this.accounts();
    const account = accounts[email];
    if (!account) return;

    const next = {
      ...accounts,
      [email]: { ...account, profile: { ...account.profile, ...changes } },
    };
    this.accounts.set(next);
    this.persistAccounts(next);
  }

  updateSettings(changes: Partial<UserSettings>): void {
    const email = this.currentEmail();
    if (!email) return;

    const accounts = this.accounts();
    const account = accounts[email];
    if (!account) return;

    const next = {
      ...accounts,
      [email]: { ...account, settings: { ...account.settings, ...changes } },
    };
    this.accounts.set(next);
    this.persistAccounts(next);
  }

  changePassword(currentPassword: string, newPassword: string): { ok: true } | { ok: false; error: string } {
    const email = this.currentEmail();
    if (!email) return { ok: false, error: 'Not signed in.' };

    const accounts = this.accounts();
    const account = accounts[email];
    if (!account || account.passwordHash !== this.hash(currentPassword)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }

    const next = {
      ...accounts,
      [email]: { ...account, passwordHash: this.hash(newPassword) },
    };
    this.accounts.set(next);
    this.persistAccounts(next);
    return { ok: true };
  }

  deleteAccount(): void {
    const email = this.currentEmail();
    if (!email) return;

    const accounts = { ...this.accounts() };
    delete accounts[email];
    this.accounts.set(accounts);
    this.persistAccounts(accounts);
    this.logout();
  }

  private startSession(email: string): void {
    this.currentEmail.set(email);
    localStorage.setItem(SESSION_KEY, email);
  }

  private loadAccounts(): Record<string, StoredAccount> {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, StoredAccount>) : {};
    } catch {
      return {};
    }
  }

  private persistAccounts(accounts: Record<string, StoredAccount>): void {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  /** NOT secure — demo-only stand-in for real server-side password hashing. */
  private hash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return `h${hash}`;
  }
}
