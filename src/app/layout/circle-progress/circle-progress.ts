import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.html',
  styleUrls: ['./circle-progress.scss'],
  standalone: false,
})
export class CircleProgress implements OnInit {

  @Input() aulasFeitas: number = 0;
  @Input() aulasTotal: number = 1;

  percentage = 0;
  radius = 60;
  circumference = 2 * Math.PI * this.radius;
  dashOffset = 0;

  ngOnInit() {
    this.percentage = (this.aulasFeitas / this.aulasTotal) * 100;

    this.dashOffset = this.circumference - (this.percentage / 100) * this.circumference;
  }
}
