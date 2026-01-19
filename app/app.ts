import { Component, OnInit  } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})

export class App implements OnInit {
  
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Escuta cada troca de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const url = event.url;

      // Lista de rotas onde o Navbar NÃO deve aparecer
      // Adicionei '/login' e '/player' (opcional, mas recomendado)
      if (url.includes('/login') || url.includes('/cadastrar')) {
        this.showNavbar = false;
      } else {
        this.showNavbar = true;
      }

    });
  }
}