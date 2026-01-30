import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundService } from '../background.service';
import { AuthService } from '../../auth.service';
import { CURSOS } from '../../data/cursos'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: false,
})
export class Navbar {

  isMenuOpen = false;
  mobileSearch = false; 
  
  todosCursos = CURSOS; 
  resultadosBusca: any[] = [];
  textoBusca: string = '';

  @ViewChild('mobileInput') mobileInput!: ElementRef;

  constructor(private router: Router, private bgService: BackgroundService, private authService: AuthService) {}

  isHiddenRoute(): boolean {
    const rotasOcultas = ['/login', '/cadastrar', '/recuperar'];
    return rotasOcultas.some(rota => this.router.url.startsWith(rota));
  }

  goHome() {
    this.router.navigate(['/']); 
    this.closeMenu();
  }

  onSearch(event: any) {
    const texto = event.target.value.toLowerCase();
    this.textoBusca = texto;
    
    this.bgService.updateSearch(texto);

    if (texto.trim() === '') {
        this.resultadosBusca = [];
    } else {
        this.resultadosBusca = this.todosCursos.filter(c => 
            c.nome.toLowerCase().includes(texto) || 
            (c.descricao && c.descricao.toLowerCase().includes(texto))
        );
    }
  }

  // === CORREÇÃO AQUI ===
  irParaCurso(id: number) {
      // 1. Encontra o curso completo na lista para enviar ao serviço
      const cursoSelecionado = this.todosCursos.find(c => c.id === id);

      // 2. Atualiza o serviço para que a View saiba o que exibir
      // (Supondo que seu serviço tenha um método para setar o curso, 
      // ou que o updateSearch dispare a lógica necessária)
      if (cursoSelecionado) {
          // Se o seu BackgroundService tiver um método específico para selecionar curso, use-o aqui.
          // Exemplo: this.bgService.selecionarCurso(cursoSelecionado);
          
          // Caso contrário, enviamos via updateSearch ou confiamos que a View lerá o ID da URL.
      }

      // 3. CORREÇÃO DA ROTA: Mudado de '/view' para '/curso' 
      // (Se '/view' não existir nas rotas, ele redireciona para Home)
      this.router.navigate(['/curso'], { queryParams: { id: id } });

      this.closeSearch();
  }

  sair() {
    this.authService.logout();
    this.closeMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openSearch() {
    this.mobileSearch = true;
    setTimeout(() => {
      if(this.mobileInput) this.mobileInput.nativeElement.focus();
    }, 100);
  }

  closeSearch() {
    this.mobileSearch = false;
    this.resultadosBusca = [];
    this.textoBusca = '';
    // Limpa a busca global ao fechar
    this.bgService.updateSearch(''); 
  }
} 