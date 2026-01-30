import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';

interface GridCell {
    id: number;
    image: string;
    active: boolean;
}

@Component({
    selector: 'app-recover-password',
    templateUrl: './recover-password.html',
    styleUrls: ['./recover-password.scss'],
    standalone: false
})
export class RecoverPassword implements OnInit, OnDestroy {

    // Visual
    allImages: string[] = [];
    gridCells: GridCell[] = [];
    intervals: any[] = [];
    logoText: string = '';
    finalText: string = 'Alexandre Bricio';

    // Formulário
    email: string = '';
    senha: string = '';
    confirmarSenha: string = '';
    
    // Controles de Senha
    showPassword = false;
    showConfirmPassword = false;
    
    // Estado
    token: string | null = null;
    temToken: boolean = false;
    isLoading: boolean = false;

    // Feedback
    mensagemSucesso: string = '';
    mensagemErro: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // 1. DETECTA O TOKEN NA URL
        // Exemplo: se a url for /recuperar?token=12345abcde
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            this.temToken = !!this.token; // Se tem token, vira TRUE e mostra a tela de senha
        });

        // Inicia visual
        this.generateImagePaths();
        this.initializeGrid();
        this.startDynamicGrid();
        this.typeWriterLoop();
    }

    ngOnDestroy(): void {
        this.intervals.forEach(i => clearInterval(i));
        this.intervals.forEach(i => clearTimeout(i));
    }

    // --- ETAPA 1: USUÁRIO PEDE O LINK ---
    enviarLink() {
        if (!this.email || !this.email.includes('@')) {
            this.mensagemErro = 'Digite um e-mail válido.';
            return;
        }
        this.isLoading = true;
        this.mensagemErro = '';
        this.mensagemSucesso = '';

        this.authService.solicitarRecuperacao(this.email).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if(res.success) {
                    this.mensagemSucesso = 'Link enviado! Verifique seu e-mail (e a caixa de spam).';
                } else {
                    this.mensagemErro = res.message || 'Erro ao enviar.';
                }
            },
            error: () => {
                this.isLoading = false;
                this.mensagemErro = 'Não foi possível conectar ao servidor.';
            }
        });
    }

    // --- ETAPA 2: USUÁRIO DEFINE NOVA SENHA ---
    alterarSenha() {
        // Validações locais
        if (this.senha.length < 6) {
            this.mensagemErro = 'A senha deve ter no mínimo 6 caracteres.';
            return;
        }
        if (this.senha !== this.confirmarSenha) {
            this.mensagemErro = 'As senhas não coincidem.';
            return;
        }

        this.isLoading = true;
        this.mensagemErro = '';

        if (this.token) {
            this.authService.redefinirSenha(this.token, this.senha).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    
                    if (res.success) {
                        this.mensagemSucesso = 'Senha alterada com sucesso! Redirecionando...';
                        
                        // Aguarda 2.5s e leva para o login
                        setTimeout(() => {
                            this.router.navigate(['/login']);
                        }, 2500);
                    } else {
                        this.mensagemErro = res.message || 'Token inválido ou expirado.';
                    }
                },
                error: () => {
                    this.isLoading = false;
                    this.mensagemErro = 'Erro ao salvar nova senha.';
                }
            });
        }
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    // ==========================================
    // LÓGICA VISUAL (FUNDO ANIMADO)
    // ==========================================
    generateImagePaths() {
        this.allImages = [];
        for (let i = 1; i <= 11; i++) {
            const name = i < 10 ? '0' + i : '' + i;
            this.allImages.push(`assets/loginscreen/${name}.jpg`);
        }
    }

    initializeGrid() {
        const totalCells = 12;
        for (let i = 0; i < totalCells; i++) {
            const imgIndex = i % this.allImages.length;
            this.gridCells.push({ id: i, image: this.allImages[imgIndex], active: true });
        }
    }

    startDynamicGrid() {
        this.gridCells.forEach((cell, index) => {
            const randomTime = Math.floor(Math.random() * 5000) + 2000;
            const interval = setInterval(() => this.changeImage(index), randomTime);
            this.intervals.push(interval);
        });
    }

    changeImage(index: number) {
        this.gridCells[index].active = false;
        setTimeout(() => {
            const currentImages = this.gridCells.map(c => c.image);
            let available = this.allImages.filter(img => !currentImages.includes(img));
            if (available.length === 0) available = this.allImages;
            
            const randomImg = available[Math.floor(Math.random() * available.length)];
            this.gridCells[index].image = randomImg;
            this.gridCells[index].active = true;
        }, 500);
    }

    typeWriterLoop() {
        let isDeleting = false;
        let charIndex = 0;
        let typeSpeed = 150;
        const tick = () => {
            if (isDeleting) {
                this.logoText = this.finalText.substring(0, charIndex - 1);
                charIndex--; typeSpeed = 75;
            } else {
                this.logoText = this.finalText.substring(0, charIndex + 1);
                charIndex++; typeSpeed = 150;
            }
            if (!isDeleting && this.logoText === this.finalText) {
                isDeleting = true; typeSpeed = 2500;
            } else if (isDeleting && this.logoText === '') {
                isDeleting = false; charIndex = 0; typeSpeed = 500;
            }
            const timer = setTimeout(tick, typeSpeed);
            this.intervals.push(timer);
        };
        tick();
    }
}