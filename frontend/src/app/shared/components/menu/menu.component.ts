import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { ProductosService } from '../../../core/services/productos.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { AlertasService } from '../../../core/services/alertas.service';

/**
 * Componente que gestiona la vista exclusiva del menú de pizzas, bebidas y postres.
 * Intención: Proveer una interfaz interactiva en forma de tabla con filtros y paginación para visualizar el catálogo de productos.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {

  /** Lista completa de productos cargados en el menú */
  listaProductos = signal<Producto[]>([]);

  /** Filtro de categoría actualmente seleccionado: 'todas', 'pizza', 'bebida', 'postre' */
  categoriaSeleccionada = signal<string>('todas');

  /** Página actual de la paginación */
  paginaActual = signal<number>(1);

  /** Cantidad de productos a mostrar por página */
  elementosPorPagina = signal<number>(55); // Ajustable según necesidad de visualización

  /** Estado de visibilidad del modal del carrito */
  modalAbierto = signal<boolean>(false);

  /** Carrito de compras interactivo (vinculado al servicio global) */
  carrito = computed(() => this.carritoService.carrito());

  /** Cantidad total de artículos agregados en el carrito */
  totalElementosCarrito = computed(() => this.carritoService.totalElementos());

  /** Monto total a pagar por los artículos en el carrito */
  totalPagarCarrito = computed(() => this.carritoService.totalPagar());

  /**
   * Intención: Constructor por defecto del componente.
   * Parámetros:
   *   - productosService (ProductosService): Servicio para consultar productos de la base de datos real.
   *   - carritoService (CarritoService): Servicio global del carrito de compras.
   *   - alertasService (AlertasService): Servicio centralizado de alertas del sistema.
   *   - router (Router): Servicio de enrutamiento de Angular.
   */
  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private alertasService: AlertasService,
    private router: Router
  ) { }

  /**
   * Intención: Inicializar el componente con datos de la base de datos de calidad premium.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Si la carga inicial de datos fallara, el estado de listaProductos quedaría vacío.
   */
  ngOnInit(): void {
    this.elementosPorPagina.set(5); // Mostramos de 5 en 5 para lucir la paginación de forma interactiva
    this.productosService.obtenerProductos().subscribe({
      next: productos => this.listaProductos.set(productos)
    });
  }



  /**
   * Intención: Obtener la lista de productos filtrada por la categoría actualmente seleccionada.
   * Parámetros: Ninguno (utiliza Signals reactivos).
   * Retorno: Producto[] - Lista filtrada de productos.
   * Casos límite: Si no hay productos que coincidan, retorna un array vacío.
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
   * Intención: Obtener los productos que pertenecen a la página actual seleccionada.
   * Parámetros: Ninguno (calcula en base a productosFiltrados, paginaActual y elementosPorPagina).
   * Retorno: Producto[] - Segmento de productos para la página activa.
   * Casos límite: Si la página actual supera el rango por un cambio de filtro, retorna el último segmento disponible.
   */
  productosPaginados = computed(() => {
    const filtrados = this.productosFiltrados();
    const indexInicio = (this.paginaActual() - 1) * this.elementosPorPagina();
    const indexFin = indexInicio + this.elementosPorPagina();
    return filtrados.slice(indexInicio, indexFin);
  });

  /**
   * Intención: Calcular la cantidad total de páginas en base a los elementos filtrados.
   * Parámetros: Ninguno.
   * Retorno: number - Total de páginas disponibles (mínimo 1).
   * Casos límite: Retorna 1 si la lista de filtrados está vacía para evitar división por cero o páginas nulas.
   */
  totalPaginas = computed(() => {
    const filtrados = this.productosFiltrados();
    const paginas = Math.ceil(filtrados.length / this.elementosPorPagina());
    return paginas > 0 ? paginas : 1;
  });

  /**
   * Intención: Cambiar el filtro de categoría y reiniciar la paginación a la página 1.
   * Parámetros:
   *   - categoria (string): La categoría seleccionada ('todas', 'pizza', 'bebida', 'postre').
   * Retorno: void.
   * Casos límite: Si recibe una categoría no válida, mantendrá los productos vacíos.
   */
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada.set(categoria);
    this.paginaActual.set(1);
  }

  /**
   * Intención: Navegar hacia una página específica del menú.
   * Parámetros:
   *   - numeroPagina (number): El número de página destino.
   * Retorno: void.
   * Casos límite:
   *   - Evita cambiar la página si el número recibido está fuera del rango de 1 a totalPaginas().
   */
  cambiarPagina(numeroPagina: number): void {
    if (numeroPagina >= 1 && numeroPagina <= this.totalPaginas()) {
      this.paginaActual.set(numeroPagina);
    }
  }

  /**
   * Intención: Generar un array de números que representa cada una de las páginas disponibles para renderizarlas en la interfaz.
   * Parámetros: Ninguno.
   * Retorno: number[] - Lista de páginas.
   * Casos límite: Retorna un array con el valor `[1]` si no hay suficientes productos.
   */
  obtenerListaPaginas = computed(() => {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas(); i++) {
      paginas.push(i);
    }
    return paginas;
  });

  /**
   * Intención: Agregar un producto seleccionado al carrito de compras y notificar al usuario.
   * Parámetros:
   *   - producto (Producto): El producto a agregar al carrito.
   * Retorno: void.
   * Casos límite:
   *   - Si el producto es nulo, no realiza ninguna acción.
   */
  agregarAlCarrito(producto: Producto): void {
    if (!producto) return;
    this.carritoService.agregarProducto(producto);
    this.alertasService.lanzarNotificacion(
      `Se agregó ${producto.nombre} al carrito de compras de forma exitosa.`,
      'aceptado'
    );
  }

  /**
   * Intención: Abrir el modal de carrito de compras si contiene elementos.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  abrirModalCarrito(): void {
    if (this.totalElementosCarrito() > 0) {
      this.modalAbierto.set(true);
    }
  }

  /**
   * Intención: Cerrar el modal del carrito de compras.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  cerrarModalCarrito(): void {
    this.modalAbierto.set(false);
  }

  /**
   * Intención: Incrementar la cantidad de un producto específico en el carrito.
   * Parámetros:
   *   - productoId (number): El identificador del producto.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  incrementarCantidad(productoId: number): void {
    this.carritoService.incrementarCantidad(productoId);
  }

  /**
   * Intención: Decrementar la cantidad de un producto específico en el carrito.
   * Parámetros:
   *   - productoId (number): El identificador del producto.
   * Retorno: void.
   * Casos límite: Si llega a 1, la siguiente llamada remueve el elemento.
   */
  decrementarCantidad(productoId: number): void {
    this.carritoService.decrementarCantidad(productoId);
  }

  /**
   * Intención: Eliminar un producto del carrito.
   * Parámetros:
   *   - productoId (number): Identificador del producto a eliminar.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  eliminarDelCarrito(productoId: number): void {
    this.carritoService.eliminarDelCarrito(productoId);
  }

  /**
   * Intención: Confirmar la compra y redirigir al proceso de checkout.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Si el carrito está vacío, no realiza redirección.
   */
  realizarPedido(): void {
    if (this.carrito().length === 0) return;
    this.cerrarModalCarrito();
    this.router.navigate(['/procesar-compra']);
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

  /**
   * Intención: Delegar al servicio la actualización del tamaño de un producto en el carrito.
   * Parámetros:
   *   - productoId (number): El identificador único del producto.
   *   - evento (any): El evento change del select en el DOM.
   * Retorno: void.
   * Casos límite: Si el evento o target son nulos, no realiza ninguna acción.
   */
  actualizarTamano(productoId: number, evento: any): void {
    if (!evento || !evento.target) return;
    const valor = evento.target.value as 'grande' | 'familiar' | 'jumbo';
    this.carritoService.actualizarTamano(productoId, valor);
  }
}
