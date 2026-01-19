import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';

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

  constructor(
    private router: Router,
    private authService: AuthService, // Nome correto
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.generateImagePaths();
    this.initializeGrid();
    this.startDynamicGrid();
    this.typeWriterLoop();
    // Sem subscribe aqui para evitar loop
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

  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user) => {
          if (user && user.idToken) {
              this.handleGoogleToken(user.idToken);
          }
      })
      .catch(err => console.error(err));
  }

  handleGoogleToken(token: string) {
      this.authService.googleAuth(token).subscribe({
          next: (res: any) => {
              if (res.success) {
                  this.router.navigate(['/']);
              } else {
                  this.errorMessage = 'Erro ao autenticar com Google.';
              }
          },
          error: (err: any) => console.error(err)
      });
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

  doLogin() {
    this.errorMessage = '';
    if (!this.email || !this.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos.'; return;
    }
    // CORREÇÃO: this.authService em vez de this.auth
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
}