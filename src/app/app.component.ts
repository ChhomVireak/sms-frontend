import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: `
    <app-loading-overlay></app-loading-overlay>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
