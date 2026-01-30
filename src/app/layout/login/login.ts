import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

interface GridCell {
    id: number;
    image: string;
    active: boolean;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    standalone: false
})
export class Login implements OnInit, OnDestroy {

    allImages: string[] = [];
    gridCells: GridCell[] = [];
    intervals: any[] = [];
    logoText: string = '';
    finalText: string = 'Alexandre Bricio';
    showPassword = false;
    email = '';
    senha = '';
    errorMessage = '';
    
    // Inicializa com um valor seguro
    googleBtnWidth: string = '350'; 

    constructor(
        private router: Router,
        private authService: AuthService,
        private socialAuthService: SocialAuthService
    ) { }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
            return;
        }

        this.updateGoogleBtnWidth();

        this.generateImagePaths();
        this.initializeGrid();
        this.startDynamicGrid();
        this.typeWriterLoop();

        this.socialAuthService.authState.subscribe((user) => {
            if (user && user.idToken) {
                this.handleGoogleToken(user.idToken);
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.updateGoogleBtnWidth();
    }

    updateGoogleBtnWidth() {
        // Pega a largura exata da janela
        const width = window.innerWidth;
        
        // Se for menor que 600px (Celular)
        if (width < 600) {
            // Subtrai 40px (20px de padding de cada lado do container)
            // Isso garante que o botão vá de ponta a ponta respeitando a margem
            this.googleBtnWidth = (width - 40).toString(); 
        } else {
            // Desktop: Trava em 400px para ficar elegante
            this.googleBtnWidth = '400'; 
        }
    }

    handleGoogleToken(token: string) {
        this.authService.googleAuth(token).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.router.navigate(['/']);
                } else {
                    this.errorMessage = 'Erro ao autenticar com Google.';
                    this.socialAuthService.signOut();
                }
            },
            error: (err: any) => {
                console.error(err);
                this.errorMessage = 'Erro de comunicação com o servidor.';
                this.socialAuthService.signOut();
            }
        });
    }

    doLogin() {
        this.errorMessage = '';
        if (!this.email || !this.senha) {
            this.errorMessage = 'Por favor, preencha todos os campos.'; return;
        }

        this.authService.login(this.email, this.senha).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.router.navigate(['/']);
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

    ngOnDestroy(): void {
        this.intervals.forEach(i => clearTimeout(i));
        this.intervals.forEach(i => clearInterval(i));
    }

    togglePassword() { this.showPassword = !this.showPassword; }

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
            const randomTime = Math.floor(Math.random() * (7000 - 2000 + 1)) + 2000;
            const interval = setInterval(() => { this.changeImage(index); }, randomTime);
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
}