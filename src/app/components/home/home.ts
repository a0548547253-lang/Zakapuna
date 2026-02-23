import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth'; // ודאי נתיב נכון
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  router: any;
  constructor(public authService: AuthService) {}
  // בתוך home.component.ts
checkAccess() {
  if (this.authService.isLoggedIn()) {
    this.router.navigate(['/add-hotel']);
  } else {
    Swal.fire({
      title: 'עצור!',
      text: 'צריך להתחבר כדי להוסיף מקום אירוח',
      icon: 'info',
      confirmButtonText: 'התחבר עכשיו',
      confirmButtonColor: '#120458'
    }).then(() => {
      this.router.navigate(['/auth']);
    });
  }
}
}