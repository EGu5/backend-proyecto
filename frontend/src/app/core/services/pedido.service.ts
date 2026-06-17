import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ItemCarrito } from '../models/carrito.model';
import { AutenticacionService } from './autenticacion.service';
import { CORTES_CAJA_MOCK, FACTURAS_MOCK } from '../models/datos-simulados';

/**
 * Interfaz que representa la estructura de un pedido activo en el sistema.
 */
export interface PedidoActivo {
  id: string;
  estado: string;
  progreso: number;
  minutos: number;
  productos: ItemCarrito[];
  detallesEntrega?: {
    metodo: string;
    direccion?: string;
    telefono: string;
    metodoPago: string;
  };
}

/**
 * Interfaz que representa un pedido histórico realizado por el cliente.
 */
export interface PedidoHistorico {
  id: string;
  fechaHora: string;
  total: number;
  estado: string;
  metodoEntrega: 'recogió en sucursal' | 'a domicilio';
  direccion?: string;
  telefono: string;
  metodoPago: string;
  cantidadTotal: number;
  productos: ItemCarrito[];
  progreso?: number;
  minutos?: number;
}

export interface FacturaDetalle {
  id: string;
  fechaHora: string;
  pedidoId: string;
  rfc: string;
  razonSocial: string;
  codigoPostal: string;
  usoCfdi: string;
  regimenFiscal: string;
  correo: string;
  total: number;
  estado: 'Emitida' | 'Cancelada';
  uuid: string;
}

export interface CorteCaja {
  id: string;
  fecha: string;
  empleado: string;
  totalVentas: number;
  cantidadPedidos: number;
  observaciones?: string;
  estado: 'Pendiente' | 'Aprobado';
}

/**
 * Servicio: PedidoService
 * Intención: Gestionar y centralizar las peticiones de pedidos contra el backend.
 */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  /** Signal reactivo que almacena la información del pedido activo en curso, o null si no hay ninguno. */
  pedidoActivo = signal<PedidoActivo | null>(null);

  /** Signal reactivo que almacena la lista completa de pedidos realizados (historial). */
  historialPedidos = signal<PedidoHistorico[]>([]);

  /** Signal reactivo que almacena el histórico de cortes de caja de los empleados. */
  cortesCaja = signal<CorteCaja[]>([]);

  /** Signal reactivo que almacena la lista de facturas generadas. */
  listaFacturas = signal<FacturaDetalle[]>([]);

  /** Signal reactivo que almacena el pedido seleccionado para facturar. */
  pedidoParaFacturar = signal<PedidoHistorico | null>(null);

  private readonly apiHost = 'http://localhost:3000/api/pedidos';

  /**
   * Constructor del servicio de pedidos.
   * Intención: Inyectar dependencias y cargar datos mock complementarios.
   */
  constructor(
    private http: HttpClient,
    private autenticacionService: AutenticacionService
  ) {
    this.cortesCaja.set(CORTES_CAJA_MOCK);
    this.listaFacturas.set(FACTURAS_MOCK);
  }

  /**
   * Calcula de forma reactiva el monto total acumulado del pedido activo.
   */
  totalPedidoActivo = computed(() => {
    const pedido = this.pedidoActivo();
    if (!pedido) return 0;
    return pedido.productos.reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0);
  });

  /**
   * Carga el historial de compras real de un cliente desde la API.
   * Intención: Sincronizar el panel del cliente con sus órdenes pasadas de la base de datos MySQL.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   * Retorno: void.
   */
  cargarHistorial(idCliente: number): void {
    this.http.get<{ exito: boolean; datos: PedidoHistorico[] }>(`${this.apiHost}/historial/${idCliente}`)
      .subscribe({
        next: respuesta => {
          if (respuesta.exito) {
            this.historialPedidos.set(respuesta.datos);
          }
        }
      });
  }

  /**
   * Crea un nuevo pedido en la base de datos real.
   * Intención: Registrar la orden y sus detalles en MySQL a través de la API.
   */
  crearPedido(
    productos: ItemCarrito[],
    metodoEntrega: string,
    direccion: string,
    telefono: string,
    metodoPago: string
  ): void {
    const idCliente = this.autenticacionService.idClienteActual() || 1;
    const totalCalc = productos.reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0) + (metodoEntrega === 'domicilio' ? 45 : 0);

    const cuerpo = {
      idCliente,
      idSucursal: 1, // Sucursal por defecto
      total: totalCalc,
      productos: productos.map(item => ({
        idProducto: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio
      }))
    };

    this.http.post<{ exito: boolean; datos: { idPedido: number } }>(this.apiHost, cuerpo)
      .subscribe({
        next: respuesta => {
          if (respuesta.exito) {
            const nuevoId = `#${respuesta.datos.idPedido}`;

            const nuevoPedido: PedidoActivo = {
              id: nuevoId,
              estado: 'Preparando',
              progreso: 20,
              minutos: 20,
              productos: [...productos],
              detallesEntrega: {
                metodo: metodoEntrega === 'domicilio' ? 'Entrega a Domicilio' : 'Recoger en Sucursal',
                direccion: metodoEntrega === 'domicilio' ? direccion : 'Sucursal Principal',
                telefono,
                metodoPago
              }
            };

            this.pedidoActivo.set(nuevoPedido);
            // Recargar historial para traer la información actualizada de la base de datos
            this.cargarHistorial(idCliente);
          }
        }
      });
  }

  incrementarCantidad(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const productosActualizados = pedido.productos.map(item => {
        if (item.producto.id === productoId) {
          return { ...item, cantidad: item.cantidad + 1 };
        }
        return item;
      });
      this.pedidoActivo.set({ ...pedido, productos: productosActualizados });
    }
  }

  decrementarCantidad(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const item = pedido.productos.find(i => i.producto.id === productoId);
      if (item) {
        if (item.cantidad > 1) {
          const productosActualizados = pedido.productos.map(i => {
            if (i.producto.id === productoId) {
              return { ...i, cantidad: i.cantidad - 1 };
            }
            return i;
          });
          this.pedidoActivo.set({ ...pedido, productos: productosActualizados });
        } else {
          this.eliminarProducto(productoId);
        }
      }
    }
  }

  eliminarProducto(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const productosActualizados = pedido.productos.filter(item => item.producto.id !== productoId);
      if (productosActualizados.length > 0) {
        this.pedidoActivo.set({ ...pedido, productos: productosActualizados });
      } else {
        this.limpiarPedidoActivo();
      }
    }
  }

  limpiarPedidoActivo(): void {
    this.pedidoActivo.set(null);
  }
}
