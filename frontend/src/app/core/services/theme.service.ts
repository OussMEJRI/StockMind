import { Injectable } from '@angular/core';

type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'stockmind-theme';
  private currentTheme: ThemeMode = 'dark';

  initTheme(): void {
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    this.currentTheme = saved === 'light' ? 'light' : 'dark';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, this.currentTheme);
    this.applyTheme();
  }

  isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }

  private applyTheme(): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(this.currentTheme === 'light' ? 'light-theme' : 'dark-theme');
    window.dispatchEvent(new CustomEvent('theme-changed'));
  }
}