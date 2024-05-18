import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="general_padding my-8">
    <router-outlet/>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {

}
