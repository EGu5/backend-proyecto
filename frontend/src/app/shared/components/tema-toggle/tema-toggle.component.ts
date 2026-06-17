import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemaService } from '../../../core/services/tema.service';

/**
 * Componente: TemaToggleComponent
 * Intención: Presentar un botón flotante altamente estético y animado que permita al usuario
 *            conmutar entre modo claro y modo oscuro en cualquier parte de la aplicación.
 *            Se ubica en la esquina inferior izquierda de la pantalla por defecto, pero se ajusta
 *            dinámicamente a la esquina inferior derecha en los paneles operativos para no interferir
 *            con el menú lateral.
 */
@Component({
  selector: 'app-tema-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tema-toggle.component.html'
})
export class TemaToggleComponent {
  /**
   * Intención: Constructor que inyecta el servicio de control de tema y el enrutador.
   * Parámetros:
   *   - temaService (TemaService): Servicio para gestionar el estado del modo oscuro.
   *   - router (Router): Servicio de enrutamiento para detectar la sección activa.
   */
  constructor(
    public readonly temaService: TemaService,
    private router: Router
  ) {}

  /**
   * Intención: Invocar la función de alternar tema en el servicio.
   * Parámetros: Ninguno.
   * Retorno: Ninguno.
   */
  conmutarTema(): void {
    this.temaService.alternarTema();
  }

  /**
   * Intención: Determinar dinámicamente la posición del botón de tema para no interferir con las barras laterales.
   * Parámetros: Ninguno.
   * Retorno: string - Clases de posicionamiento CSS de Tailwind.
   */
  obtenerClasePosicion(): string {
    const url = this.router.url;
    if (url.includes('empleado') || url.includes('administrador')) {
      return 'fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer bg-white text-[#d6254d] border border-gray-150 dark:bg-[#3D2E31] dark:text-[#fdeba9] dark:border-[#4B383C]';
    }
    return 'fixed bottom-8 left-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer bg-white text-[#d6254d] border border-gray-150 dark:bg-[#3D2E31] dark:text-[#fdeba9] dark:border-[#4B383C]';
  }
}
export default TemaToggleComponent;
