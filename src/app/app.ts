import { Component, OnInit  } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  
  showNavbar = true;

  showSessionModal = false;
  userEmail: string = '';
  loadingRecuperacao = false;
  msgRecuperacao = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Escuta o evento de sessão expirada
    this.authService.sessionExpired$.subscribe(() => {
        // Pega o email antes de limpar os dados (para usar no botão de recuperação)
        const user = this.authService.getUser();
        if(user) this.userEmail = user.email;

        // Mostra o modal
        this.showSessionModal = true;
        
        // Limpa os dados locais mas NÃO redireciona ainda (o modal bloqueia a tela)
        this.authService.logout(false); 
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const url = event.url;
      // Adicione aqui outras rotas onde a Navbar não deve aparecer
      if (url.includes('/login') || url.includes('/cadastrar')) {
        this.showNavbar = false;
      } else {
        this.showNavbar = true;
      }
    });
  }

  // Botão: "Fui eu / Entendi" -> Vai pro login
  irParaLogin() {
    this.showSessionModal = false;
    this.router.navigate(['/login']);
  }

  // Botão: "Não fui eu" -> Envia e-mail e depois vai pro login
  enviarRecuperacao() {
    if(!this.userEmail) return;
    
    this.loadingRecuperacao = true;
    this.authService.solicitarRecuperacao(this.userEmail).subscribe({
        next: (res) => {
            this.loadingRecuperacao = false;
            this.msgRecuperacao = 'E-mail de segurança enviado! Verifique sua caixa de entrada.';
            
            // Fecha e redireciona após 3 segundos
            setTimeout(() => {
                this.irParaLogin();
            }, 3000);
        },
        error: () => {
            this.loadingRecuperacao = false;
            this.msgRecuperacao = 'Erro ao enviar. Tente pelo login.';
        }
    });
  }
}