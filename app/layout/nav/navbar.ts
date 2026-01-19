import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: false,
})
export class Navbar {

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']); 
  }

}
