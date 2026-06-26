import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { entorno } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  usuarioActual = signal<Usuario | null>(null);
  idClienteActual = signal<number | null>(null);
  private readonly apiHost = `${entorno.urlBaseApi}/autenticacion`;

  constructor(private http: HttpClient) {}

  iniciarSesion(correo: string, contrasenia: string): Observable<boolean> {
    if (!correo || !contrasenia) {
      return of(false);
    }

    return this.http.post<{ exito: boolean; datos: any }>(`${this.apiHost}/login`, {
      correo: correo.trim().toLowerCase(),
      contrasena: contrasenia.trim()
    }).pipe(
      map(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          const datos = respuesta.datos;

          let rolFront: 'cliente' | 'empleado' | 'admin' = 'cliente';
          if (datos.rol === 'administrador') {
            rolFront = 'admin';
          } else if (datos.rol === 'empleado') {
            rolFront = 'empleado';
          }

          const usuario: Usuario = {
            id: datos.id,
            nombre: `${datos.nombre || ''} ${datos.apellido || ''}`.trim() || datos.correo,
            correo: datos.correo,
            rol: rolFront,
            puesto: datos.puesto
          };

          this.usuarioActual.set(usuario);
          this.idClienteActual.set(datos.idCliente || datos.idEmpleado || null);
          localStorage.setItem('token', datos.token);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  registrar(nombre: string, apellido: string, correo: string, contrasenia: string, telefono: string): Observable<boolean> {
    if (!nombre || !apellido || !correo || !contrasenia || !telefono) {
      return of(false);
    }

    return this.http.post<{ exito: boolean; datos: any }>(`${this.apiHost}/registro`, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      contrasena: contrasenia.trim(),
      telefono: telefono.trim(),
      direccion: ''
    }).pipe(
      map(respuesta => respuesta.exito),
      catchError(() => of(false))
    );
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null);
    this.idClienteActual.set(null);
    localStorage.removeItem('token');
  }

  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }
}