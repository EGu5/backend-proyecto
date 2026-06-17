import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaToggleComponent } from './shared/components/tema-toggle/tema-toggle.component';
import { NotificacionToastComponent } from './shared/components/notificacion-toast/notificacion-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TemaToggleComponent, NotificacionToastComponent],
  templateUrl: './app.html'
})
export class App {
  //protected readonly title = signal('proyecto');
  titulo:string ="backend";
}

