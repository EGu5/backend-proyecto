import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente: AlertaMensajeComponent
 * Intención: Presentar de forma estructurada cualquier tipo de error, alerta o éxito (aceptado),
 *            mostrando la interpretación no técnica para el usuario común y permitiendo opcionalmente
 *            desglosar los detalles técnicos y de desarrollo.
 * Casos límite:
 *   - Si no se provee código o descripción técnica, se omiten esos apartados de la sección de detalles.
 *   - Se adapta dinámicamente al tipo de alerta recibida aplicando estilos específicos.
 */
@Component({
  selector: 'app-alerta-mensaje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-mensaje.component.html'
})
export class AlertaMensajeComponent {
  /**
   * Tipo de alerta a mostrar. Define el estilo visual y el comportamiento semántico del componente.
   * Valores permitidos: 'error', 'alerta', 'aceptado'.
   */
  @Input() tipo: 'error' | 'alerta' | 'aceptado' = 'error';

  /**
   * Código único identificador del error o la alerta (ej. 'CAMPOS_VACIOS').
   */
  @Input() codigo: string = '';

  /**
   * Detalles a nivel técnico de lo que falló, útil para logs o soporte avanzado.
   */
  @Input() descripcionTecnica: string = '';

  /**
   * Explicación detallada orientada al desarrollador para depuración en entornos locales o de pruebas.
   */
  @Input() explicacionDesarrollador: string = '';

  /**
   * Mensaje claro y en lenguaje natural orientado al usuario común.
   */
  @Input() mensajeUsuario: string = '';

  /**
   * Controla la visualización del panel colapsable que contiene los detalles técnicos.
   */
  mostrarDetalles = signal<boolean>(false);

  /**
   * Evento que se dispara cuando el usuario decide cerrar o descartar la alerta.
   */
  @Output() alCerrar = new EventEmitter<void>();

  /**
   * Alterna la visibilidad del bloque de detalles técnicos para desarrolladores.
   * Intención: Permitir al usuario o desarrollador inspeccionar información avanzada del error.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  alternarDetalles(): void {
    this.mostrarDetalles.update(valor => !valor);
  }

  /**
   * Emite el evento de cierre del componente para que el componente padre pueda reaccionar y ocultarlo.
   * Intención: Limpiar el estado de alerta en la vista contenedora.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  cerrarAlerta(): void {
    this.alCerrar.emit();
  }

  /**
   * Devuelve las clases CSS correspondientes según el tipo de alerta seleccionado.
   * Intención: Aplicar el color y diseño adecuado (error, alerta o aceptado) de acuerdo a la paleta del proyecto.
   * Parámetros: Ninguno.
   * Retorno: string - Nombre de la clase de estilos CSS.
   */
  obtenerClaseTipo(): string {
    switch (this.tipo) {
      case 'aceptado':
        return 'alerta-aceptado';
      case 'alerta':
        return 'alerta-advertencia';
      case 'error':
      default:
        return 'alerta-error';
    }
  }
}
