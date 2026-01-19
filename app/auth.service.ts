import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Endereço da sua API PHP (ajuste se sua pasta for diferente)
  private apiUrl = 'http://localhost/api';

  // Gerencia o estado do usuário (se está logado ou não)
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Tenta recuperar o usuário se ele der F5 na página
    const savedUser = localStorage.getItem('alexandre_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // === LOGIN REAL ===
  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, { email, senha })
      .pipe(
        tap(response => {
          if (response.success) {
            // Salva no estado e no LocalStorage para persistir
            this.currentUserSubject.next(response.user);
            localStorage.setItem('alexandre_user', JSON.stringify(response.user));
          }
        })
      );
  }

  // === LOGOUT ===
  logout() {
    localStorage.removeItem('alexandre_user');
    this.currentUserSubject.next(null);
  }

  // === CADASTRO ===
  cadastrar(nome: string, email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cadastro.php`, { nome, email, senha });
  }

  // Retorna o valor atual do usuário (sem ser observable)
  getUser() {
    return this.currentUserSubject.value;
  }

  // === LOGIN COM GOOGLE (Envia token pro PHP) ===
  googleAuth(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google_auth.php`, { token })
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem('alexandre_user', JSON.stringify(response.user));
          }
        })
      );
  }
}