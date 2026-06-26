//import datosSimuladosJson from '../../../../../pruebas/datos-simulados.json';

export interface ProductoSimulado {
  id: number;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  precio: number;
  categoria: 'pizza' | 'bebida' | 'postre';
  tamano: 'individual' | 'mediano' | 'familiar' | 'no aplica';
}

export const PRODUCTOS_MOCK: ProductoSimulado[] = [];
export const INGREDIENTES_MOCK: any[] = [];
export const EMPLEADOS_MOCK: any[] = [];
export const SUCURSALES_MOCK: any[] = [];
export const FACTURAS_MOCK: any[] = [];
export const PEDIDOS_MOCK: any[] = [];
export const CORTES_CAJA_MOCK: any[] = [];