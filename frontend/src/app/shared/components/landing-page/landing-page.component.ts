import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { ProductosService } from '../../../core/services/productos.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { AlertasService } from '../../../core/services/alertas.service';

/**
 * Componente que representa la página de aterrizaje (Landing Page).
 * Intención: Mostrar la presentación del negocio (pizzería), el menú de especialidades y las ofertas disponibles.
 * Casos límite:
 *   - Si no hay conexión al backend, muestra una lista vacía o maneja el error mediante el flujo de alertas.
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent implements OnInit {
  /** Lista completa de productos cargados desde la base de datos */
  listaProductos = signal<Producto[]>([]);

  /** Filtro de categoría actualmente seleccionado ('todas', 'pizza', 'bebida', 'postre') */
  categoriaSeleccionada = signal<string>('todas');

  /**
   * Intención: Constructor de la clase para inyectar dependencias.
   * Parámetros:
   *   - productosService (ProductosService): Servicio para consultar productos de la base de datos.
   *   - carritoService (CarritoService): Servicio del carrito de compras.
   *   - alertasService (AlertasService): Servicio centralizado de notificaciones.
   */
  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private alertasService: AlertasService
  ) {}

  /**
   * Intención: Cargar todos los productos reales de la base de datos al inicializar.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Si la base de datos no está disponible, la lista de productos quedará vacía.
   */
  ngOnInit(): void {
    this.productosService.obtenerProductos().subscribe({
      next: productos => this.listaProductos.set(productos)
    });
  }

  /**
   * Intención: Filtrar los productos reactivamente por la categoría seleccionada.
   * Parámetros: Ninguno.
   * Retorno: Producto[] - Lista filtrada de productos.
   * Casos límite: Si no coincide ningún producto, retorna una lista vacía.
   */
  productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    const productos = this.listaProductos();

    if (categoria === 'todas') {
      return productos;
    }
    return productos.filter(p => p.categoria === categoria);
  });

  /**
   * Intención: Cambiar la categoría de filtro seleccionada.
   * Parámetros:
   *   - categoria (string): Nombre de la categoría ('todas', 'pizza', 'bebida', 'postre').
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada.set(categoria);
  }

  /**
   * Intención: Agregar un producto seleccionado al carrito de compras global.
   * Parámetros:
   *   - producto (Producto): El producto a añadir.
   * Retorno: void.
   * Casos límite: Si el producto recibido es nulo, no realiza ninguna acción.
   */
  agregarAlCarrito(producto: Producto): void {
    if (!producto) return;
    this.carritoService.agregarProducto(producto);
    this.alertasService.lanzarNotificacion(
      `Se agregó ${producto.nombre} al carrito con éxito.`,
      'aceptado'
    );
  }

  /**
   * Intención: Retornar una URL de imagen relacionada o de respaldo basada en el nombre o categoría.
   * Parámetros:
   *   - producto (Producto): El producto a evaluar.
   * Retorno: string - URL final de la imagen.
   * Casos límite: Si el producto es nulo, retorna imagen genérica.
   */
  obtenerImagenProducto(producto: any): string {
    if (!producto) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
    }
    if (producto.imagenUrl && producto.imagenUrl.trim() !== '' && !producto.imagenUrl.includes('broken') && producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    const nombre = (producto.nombre || '').toLowerCase();
    const categoria = (producto.categoria || '').toLowerCase();

    if (nombre.includes('pepperoni')) {
      return 'https://images.unsplash.com/photo-1628840042765-356cda07504e';
    } else if (nombre.includes('hawaiana')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38';
    } else if (nombre.includes('mexicana')) {
      return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002';
    } else if (nombre.includes('queso') || nombre.includes('cuatro')) {
      return 'https://images.unsplash.com/photo-1548365328-9f547fb0953b';
    } else if (nombre.includes('tiramis') || nombre.includes('postre') || categoria === 'postre') {
      return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9';
    } else if (categoria === 'bebida' || nombre.includes('refresco') || nombre.includes('coca') || nombre.includes('agua')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97';
    }
    
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
  }
}
