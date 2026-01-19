import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

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

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.generateImagePaths();
    this.initializeGrid();
    this.startDynamicGrid();
    this.typeWriterLoop();
  }

  ngOnDestroy(): void {
    this.intervals.forEach(i => clearTimeout(i));
    this.intervals.forEach(i => clearInterval(i));
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // === 1. LISTA EXATA DAS 11 IMAGENS ===
  generateImagePaths() {
    this.allImages = [];
    
    // Gera de 1 a 11 (conforme sua quantidade atual)
    for (let i = 1; i <= 11; i++) {
      // Regra do zero: se menor que 10 usa '01', se maior usa '10', '11'
      const name = i < 10 ? '0' + i : '' + i;
      this.allImages.push(`assets/loginscreen/${name}.jpg`);
    }
  }

  // === 2. INICIALIZAÇÃO SEGURA (Preenche tudo) ===
  initializeGrid() {
    const totalCells = 12; // O Grid tem 12 espaços
    
    for (let i = 0; i < totalCells; i++) {
      // Usa o operador % (módulo) para fazer um loop nas imagens.
      // Se i=11 (12ª célula) e temos 11 imagens, ele pega a imagem [0] de novo.
      // Isso garante que NUNCA fique vazio.
      const imgIndex = i % this.allImages.length;
      
      this.gridCells.push({
        id: i,
        image: this.allImages[imgIndex], 
        active: true
      });
    }
  }

  // === 3. ANIMAÇÃO (Permite repetir se necessário) ===
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
      // Lógica Blindada:
      // Tenta achar imagens que não estão na tela.
      const currentImagesOnScreen = this.gridCells.map(c => c.image);
      let availableImages = this.allImages.filter(img => !currentImagesOnScreen.includes(img));

      // SE não tiver nenhuma imagem "nova" (porque temos poucas fotos),
      // libera usar QUALQUER imagem da pasta para não ficar preto.
      if (availableImages.length === 0) {
        availableImages = this.allImages; 
      }

      // Sorteia uma das disponíveis
      const randomFallback = Math.floor(Math.random() * availableImages.length);
      this.gridCells[index].image = availableImages[randomFallback];
      
      this.gridCells[index].active = true;
    }, 500); 
  }

  // ... (typeWriterLoop e doRegister mantidos iguais) ...
  typeWriterLoop() {
    let isDeleting = false;
    let charIndex = 0;
    let typeSpeed = 150; 
    const tick = () => {
      if (isDeleting) {
        this.logoText = this.finalText.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 75; 
      } else {
        this.logoText = this.finalText.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150; 
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
               if (loginRes.success) this.router.navigate(['/']);
               else this.router.navigate(['/login']);
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