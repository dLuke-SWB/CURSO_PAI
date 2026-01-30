import { Component, OnInit, OnDestroy, HostListener } from '@angular/core'; // <--- 1. Import HostListener
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

interface GridCell {
    id: number;
    image: string;
    active: boolean;
}

@Component({
    selector: 'app-register',
    templateUrl: './register.html',
    styleUrls: ['./register.scss'],
    standalone: false
})
export class Register implements OnInit, OnDestroy {

    allImages: string[] = [];
    gridCells: GridCell[] = [];
    intervals: any[] = [];

    logoText: string = '';
    finalText: string = 'Alexandre Bricio';

    showPassword = false;
    showConfirmPassword = false;

    nome = '';
    email = '';
    senha = '';
    confirmSenha = '';
    errorMessage = '';

    // <--- 2. Variável para largura dinâmica
    googleBtnWidth: string = '350';

    constructor(
        private router: Router,
        private authService: AuthService,
        private socialAuthService: SocialAuthService
    ) { }

    ngOnInit(): void {
        // <--- 3. Calcula largura inicial ao abrir
        this.updateGoogleBtnWidth();

        this.generateImagePaths();
        this.initializeGrid();
        this.startDynamicGrid();
        this.typeWriterLoop();

        // CADASTRO VIA GOOGLE
        this.socialAuthService.authState.subscribe((user) => {
            console.log('Tentativa de cadastro via Google:', user);

            if (user && user.idToken) {
                this.authService.googleAuth(user.idToken).subscribe({
                    next: (res: any) => {
                        if (res.success) {
                            localStorage.setItem('usuario', JSON.stringify(res.user));
                            this.router.navigate(['/']);
                        } else {
                            this.errorMessage = 'Erro ao processar conta Google.';
                        }
                    },
                    error: (err) => {
                        console.error(err);
                        this.errorMessage = 'Falha de comunicação com o Google.';
                    }
                });
            }
        });
    }

    // <--- 4. Listener para redimensionamento (Girar a tela ou mudar tamanho)
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.updateGoogleBtnWidth();
    }

    // <--- 5. Lógica de cálculo (Igual ao Login)
    updateGoogleBtnWidth() {
        const width = window.innerWidth;
        
        // Se for Mobile (menor que 600px)
        if (width < 600) {
            // Largura da tela menos 40px (20px de padding de cada lado)
            // Isso faz o botão encher a tela igual aos inputs
            this.googleBtnWidth = (width - 40).toString();
        } else {
            // Desktop: Fixo em 380 (ou 400 se quiser igualar exatamente aos inputs desktop)
            this.googleBtnWidth = '380';
        }
    }

    ngOnDestroy(): void {
        this.intervals.forEach(i => clearTimeout(i));
        this.intervals.forEach(i => clearInterval(i));
    }

    togglePassword() { this.showPassword = !this.showPassword; }
    toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

    // === IMAGENS E ANIMAÇÕES ===
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
            this.gridCells.push({
                id: i,
                image: this.allImages[imgIndex],
                active: true
            });
        }
    }

    startDynamicGrid() {
        this.gridCells.forEach((cell, index) => {
            const randomTime = Math.floor(Math.random() * (7000 - 2000 + 1)) + 2000;
            const interval = setInterval(() => {
                this.changeImage(index);
            }, randomTime);
            this.intervals.push(interval);
        });
    }

    changeImage(index: number) {
        this.gridCells[index].active = false;
        setTimeout(() => {
            const currentImagesOnScreen = this.gridCells.map(c => c.image);
            let availableImages = this.allImages.filter(img => !currentImagesOnScreen.includes(img));
            if (availableImages.length === 0) availableImages = this.allImages;
            const randomFallback = Math.floor(Math.random() * availableImages.length);
            this.gridCells[index].image = availableImages[randomFallback];
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

    // === CADASTRO MANUAL ===
    doRegister() {
        this.errorMessage = '';

        if (!this.nome || !this.email || !this.senha || !this.confirmSenha) {
            this.errorMessage = 'Preencha todos os campos.'; return;
        }
        if (this.senha !== this.confirmSenha) {
            this.errorMessage = 'As senhas não coincidem.'; return;
        }

        this.authService.cadastrar(this.nome, this.email, this.senha).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.authService.login(this.email, this.senha).subscribe({
                        next: (loginRes: any) => {
                            if (loginRes.success) {
                                localStorage.setItem('usuario', JSON.stringify(loginRes.user));
                                this.router.navigate(['/']);
                            } else {
                                this.router.navigate(['/login']);
                            }
                        }
                    });
                } else {
                    this.errorMessage = res.message;
                }
            },
            error: (err: any) => {
                console.error(err);
                this.errorMessage = 'Erro ao conectar com o servidor.';
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}