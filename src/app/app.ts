import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'my-game-store-frontend';
}
