import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressoService {

  // Ajuste para o caminho da sua API
  private apiUrl = 'http://localhost/api'; 
  
  // Cache em memória para o HTML consultar rápido sem travar
  private listaProgresso: any[] = []; 

  constructor(private http: HttpClient) { }

  // 1. CARREGAR (Lê do Banco ao iniciar o curso)
  carregarProgresso(usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ler_progresso.php`, { usuario_id: usuarioId })
      .pipe(
        tap((res: any) => {
          if (res.success) {
            this.listaProgresso = res.dados; // Guarda no cache [{curso_id: 1, aula_id: 2}, ...]
            console.log('Progresso carregado:', this.listaProgresso);
          }
        })
      );
  }

  // 2. SALVAR (Envia para o Banco)
  marcarConcluido(usuarioId: number, cursoId: number, aulaId: number): Observable<any> {
    
    // Otimização: Se já estiver na lista local, nem chama o servidor (economiza dados)
    if (this.isConcluido(cursoId, aulaId)) {
        // Retorna um Observable vazio só para não quebrar quem chamou
        return new Observable(observer => { observer.next({ success: true }); observer.complete(); });
    }

    return this.http.post(`${this.apiUrl}/salvar_progresso.php`, { 
      usuario_id: usuarioId, 
      curso_id: cursoId, 
      aula_id: aulaId 
    }).pipe(
      tap((res: any) => {
        if (res.success) {
          // Se salvou no banco com sucesso, atualiza a lista local instantaneamente
          this.listaProgresso.push({ curso_id: cursoId, aula_id: aulaId });
        }
      })
    );
  }

  // 3. VERIFICAR (Consulta o Cache local - Instantâneo para o *ngIf)
  isConcluido(cursoId: number, aulaId: number): boolean {
    if (!this.listaProgresso.length) return false;

    // Verifica se existe algum item no array com esse curso E essa aula
    // O uso de == (dois iguais) é proposital para comparar string "1" com number 1 se necessário
    return this.listaProgresso.some(p => p.curso_id == cursoId && p.aula_id == aulaId);
  }
}