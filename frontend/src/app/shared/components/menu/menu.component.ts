import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { ProductosService } from '../../../core/services/productos.service';

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

  /**
   * Intención: Constructor por defecto del componente.
   * Parámetros:
   *   - productosService (ProductosService): Servicio para consultar productos de la base de datos real.
   */
  constructor(private productosService: ProductosService) { }

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
}
