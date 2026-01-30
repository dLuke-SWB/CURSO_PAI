import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // URL do Backend (Ajuste para o seu IP local)
    private apiUrl = 'http://192.168.15.20/api'; 
    
    // Estado do Usuário
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // Evento para avisar o App Component que a sessão caiu
    public sessionExpired$ = new Subject<void>(); 
    
    // Variável para guardar o timer do intervalo
    private checkInterval: any; 

    constructor(
        private http: HttpClient,
        private router: Router,
        private socialAuthService: SocialAuthService
    ) {
        // Ao abrir o app, verifica se já tem usuário salvo
        const savedUser = localStorage.getItem('usuario');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                this.currentUserSubject.next(user);
                
                // Se tem usuário, começa a vigiar a sessão imediatamente
                this.iniciarMonitoramento(user); 
            } catch (e) { 
                this.logout(); 
            }
        }
    }

    // =================================================
    // 1. MONITORAMENTO DE SESSÃO ÚNICA
    // =================================================
    
    private iniciarMonitoramento(user: any) {
        // Limpa timer anterior para não duplicar
        this.pararMonitoramento();

        // Verifica a cada 10 segundos (10000ms)
        this.checkInterval = setInterval(() => {
            if (!user || !user.session_token) return;

            this.http.post(`${this.apiUrl}/check_session.php`, { 
                id: user.id, 
                email: user.email,
                token: user.session_token // Envia o token local para comparar com o banco
            }).subscribe({
                next: (res: any) => {
                    // Se valid for false, significa que o token no banco mudou (outro login)
                    if (!res.valid) {
                        console.warn('Sessão invalidada pelo servidor.');
                        this.pararMonitoramento();
                        // Avisa o AppComponent para abrir o Modal
                        this.sessionExpired$.next(); 
                    }
                },
                error: (err) => console.error('Erro silencioso na verificação de sessão', err)
            });
        }, 10000); 
    }

    private pararMonitoramento() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // =================================================
    // 2. AUTENTICAÇÃO (LOGIN / GOOGLE / LOGOUT)
    // =================================================

    login(email: string, senha: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login.php`, { email, senha })
            .pipe(tap(response => { 
                if (response.success) {
                    this.salvarSessao(response.user);
                    // Começa a monitorar assim que loga
                    this.iniciarMonitoramento(response.user);
                }
            }));
    }

    googleAuth(token: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/google_auth.php`, { token })
            .pipe(tap(response => { 
                if (response.success) {
                    this.salvarSessao(response.user);
                    this.iniciarMonitoramento(response.user);
                }
            }));
    }

    /**
     * @param redirecionar Se true, leva para /login. Se false, só limpa dados (usado pelo Modal).
     */
    logout(redirecionar = true) {
        this.pararMonitoramento(); // Para de checar o backend
        
        // Limpa dados locais
        localStorage.removeItem('usuario');
        localStorage.clear();
        this.currentUserSubject.next(null);

        // Se for um logout voluntário, avisa o backend e o Google
        if (redirecionar) {
            this.http.post(`${this.apiUrl}/logout.php`, {}).subscribe();
            
            this.socialAuthService.signOut().catch((err) => {
                console.log('Google signOut ignorado ou falhou:', err);
            }).finally(() => {
                this.router.navigate(['/login']);
            });
        }
    }

    private salvarSessao(user: any) {
        if (!user.cursos_ids) user.cursos_ids = [];
        this.currentUserSubject.next(user);
        localStorage.setItem('usuario', JSON.stringify(user));
    }

    cadastrar(nome: string, email: string, senha: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cadastro.php`, { nome, email, senha });
    }

    // =================================================
    // 3. RECUPERAÇÃO DE SENHA (PHP PURO)
    // =================================================

    solicitarRecuperacao(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot_password.php`, { email });
    }

    redefinirSenha(token: string, novaSenha: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset_password.php`, { token, password: novaSenha });
    }

    // =================================================
    // 4. PERFIL E UTILITÁRIOS
    // =================================================

    temCurso(cursoId: number): boolean {
        const user = this.getUser();
        if (!user || !user.cursos_ids) return false;

        const lista: any[] = user.cursos_ids;
        if (!Array.isArray(lista)) return false;

        const listaNumerica = lista.map(id => Number(id));
        return listaNumerica.includes(Number(cursoId));
    }

    getUser() {
        const data = localStorage.getItem('usuario');
        if (data) {
            try { return JSON.parse(data); } catch (e) { return null; }
        }
        return null;
    }

    isAuthenticated(): boolean {
        const user = this.getUser();
        return (user !== null && user.id !== undefined);
    }

    updateProfile(id: number, newEmail: string) {
        return this.http.post(`${this.apiUrl}/update_profile.php`, { id, new_email: newEmail });
    }

    updatePassword(id: number, newPass: string) {
        return this.http.post(`${this.apiUrl}/update_password.php`, { id, new_password: newPass });
    }

    sendVerificationCode(id: number, currentEmail: string) {
        return this.http.post(`${this.apiUrl}/send_code.php`, { id, email: currentEmail });
    }

    verifyAndUpdate(id: number, code: string, newEmail: string, newPass: string) {
        return this.http.post(`${this.apiUrl}/verify_update.php`, { 
            id, code, new_email: newEmail, new_password: newPass 
        });
    }
}