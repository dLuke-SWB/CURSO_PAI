import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

// Permite usar o Bootstrap JS diretamente
declare var bootstrap: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  standalone: false
})
export class Settings implements OnInit {
  
  // Dados do Usuário
  user: any = { id: 0, name: '', email: '', initials: '', plano: '', membroDesde: '', googleLinked: false };
  stats = { cursosComprados: 0, aulasAssistidas: 0, certificados: 0 };

  // Inputs
  novoEmail: string = '';
  novaSenha: string = '';
  confirmaSenha: string = '';
  
  // Modal e Loading
  showModal = false;
  verificationCode: string = ''; 
  hidePassword = true;
  isLoading = false;

  // === VARIÁVEIS DO TOAST ===
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void { 
    this.carregarDadosUsuario(); 
  }

  // === NOVA FUNÇÃO: EXIBIR TOAST ===
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;

    // Pega o elemento HTML e inicializa via Bootstrap JS
    const toastEl = document.getElementById('settingsToast');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  carregarDadosUsuario() {
      const rawData = localStorage.getItem('usuario');
      if (rawData) {
          const dbUser = JSON.parse(rawData);
          this.user.id = dbUser.id;
          this.user.name = dbUser.nome;
          this.user.email = dbUser.email;
          this.user.initials = this.getIniciais(dbUser.nome);
          this.user.googleLinked = (dbUser.google_user == 1);
          const dataCriacao = dbUser.created_at || dbUser.criado_em || new Date();
          this.user.membroDesde = this.formatarData(dataCriacao);
          this.user.plano = (dbUser.cursos_comprados > 0) ? 'Aluno' : 'Aluno';
          this.stats.cursosComprados = dbUser.cursos_comprados || 0;
          this.stats.aulasAssistidas = dbUser.aulas_concluidas || 0;
          this.stats.certificados = dbUser.certificados || 0;
      }
  }

  // === PASSO 1: INICIAR (COM TOASTS) ===
  iniciarAlteracao() {
    if (!this.novoEmail && !this.novaSenha) {
        this.showToast("Preencha o e-mail ou a senha para alterar.", 'error');
        return;
    }
    
    if (this.novaSenha) {
        if (this.novaSenha !== this.confirmaSenha) {
            this.showToast("As senhas não coincidem.", 'error'); return;
        }
        if (this.novaSenha.length < 6) {
            this.showToast("A senha deve ter no mínimo 6 caracteres.", 'error'); return;
        }
    }

    if (this.novoEmail && this.novoEmail === this.user.email) {
        this.showToast("O novo e-mail é igual ao atual.", 'error'); return;
    }

    this.isLoading = true;

    this.authService.sendVerificationCode(this.user.id, this.user.email).subscribe({
        next: (res: any) => {
            this.isLoading = false;
            
            if (res.success) {
                // Toast de Sucesso
                this.showToast("Código enviado para " + this.user.email, 'success');
                
                if(res.debug_code) {
                   // Se for debug, mantemos o alert pois é para desenvolvimento
                   alert("DEBUG (Localhost): " + res.debug_code);
                }

                this.showModal = true;
                this.verificationCode = ''; 
            } else {
                this.showToast(res.message, 'error');
            }
        },
        error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.showToast("Erro ao conectar com o servidor.", 'error');
        }
    });
  }

  // === PASSO 2: CONFIRMAR (COM TOASTS) ===
  confirmarCodigo() {
      if (!this.verificationCode || this.verificationCode.length !== 6) {
          this.showToast("O código deve ter 6 dígitos.", 'error');
          return;
      }

      this.isLoading = true;

      this.authService.verifyAndUpdate(
          this.user.id, 
          this.verificationCode, 
          this.novoEmail, 
          this.novaSenha
      ).subscribe({
          next: (res: any) => {
              this.isLoading = false;
              
              if (res.success) {
                  this.showToast(res.message, 'success'); // Toast de sucesso final
                  this.showModal = false;

                  if (res.new_email) {
                      this.user.email = res.new_email;
                      this.atualizarLocalStorage('email', res.new_email);
                  }

                  this.novoEmail = '';
                  this.novaSenha = '';
                  this.confirmaSenha = '';
                  this.verificationCode = '';

              } else {
                  this.showToast(res.message, 'error'); // Toast de erro (ex: código errado)
              }
          },
          error: (err) => {
              console.error(err);
              this.isLoading = false;
              this.showToast("Erro ao validar dados.", 'error');
          }
      });
  }

  cancelarModal() {
      this.showModal = false;
      this.isLoading = false;
      this.verificationCode = '';
  }

  atualizarLocalStorage(campo: string, valor: any) {
      const rawData = localStorage.getItem('usuario');
      if (rawData) {
          const currentUser = JSON.parse(rawData);
          currentUser[campo] = valor;
          localStorage.setItem('usuario', JSON.stringify(currentUser));
      }
  }

  getIniciais(nome: string): string {
    if (!nome) return '';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  }

  togglePassword() { this.hidePassword = !this.hidePassword; }
}