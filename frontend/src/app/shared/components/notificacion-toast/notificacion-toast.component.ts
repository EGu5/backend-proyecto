import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertasService, NotificacionToast } from '../../../core/services/alertas.service';

/**
 * Componente: NotificacionToastComponent
 * Intención: Presentar una pila de notificaciones flotantes en la esquina superior de la interfaz,
 *            con alta prioridad visual, permitiendo enterarse de eventos importantes (errores, alertas, éxitos)
 *            sin interrumpir las operaciones del usuario.
 * Casos límite:
 *   - Si no existen notificaciones en la pila, el componente no dibuja ningún elemento DOM ni bloquea clicks.
 *   - Maneja la eliminación por temporizadores configurados individualmente en el servicio.
 */
@Component({
  selector: 'app-notificacion-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-toast.component.html'
})
export class NotificacionToastComponent {
  /**
   * Constructor del componente de notificaciones flotantes.
   * Intención: Inyectar el servicio de alertas que contiene el estado global y los métodos de control.
   * Parámetros:
   *   - alertasService (AlertasService): Servicio centralizado de alertas y errores de la aplicación.
   */
  constructor(private alertasService: AlertasService) {}

  /**
   * Obtiene la colección reactiva de notificaciones activas desde el servicio.
   * Intención: Permitir que el HTML itere sobre la lista viva de mensajes toast.
   * Retorno: NotificacionToast[] - Arreglo de notificaciones vigentes.
   */
  obtenerNotificaciones(): NotificacionToast[] {
    return this.alertasService.notificaciones();
  }

  /**
   * Remueve de forma manual una notificación de la pantalla a petición del usuario.
   * Intención: Permitir el descarte rápido de mensajes.
   * Parámetros:
   *   - id (string): Identificador único de la notificación a eliminar.
   * Retorno: void.
   */
  descartar(id: string): void {
    this.alertasService.removerNotificacion(id);
  }

  /**
   * Determina la clase CSS de borde y color correspondiente según el tipo de notificación.
   * Intención: Aplicar el estilo correspondiente según la naturaleza de la alerta (error, advertencia, exito/aceptado).
   * Parámetros:
   *   - tipo ('error' | 'alerta' | 'aceptado'): Tipo de mensaje.
   * Retorno: string - Nombre de la clase CSS específica.
   */
  obtenerClaseTipo(tipo: 'error' | 'alerta' | 'aceptado'): string {
    switch (tipo) {
      case 'alerta':
        return 'toast-advertencia';
      case 'aceptado':
        return 'toast-aceptado';
      case 'error':
      default:
        return 'toast-error';
    }
  }
}
