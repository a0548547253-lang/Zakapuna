import { Component, OnInit } from '@angular/core'; // הוסיפי OnInit כאן
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Information } from '../../../services/information';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-hotel',
  standalone: true,
  templateUrl: './add-hotel.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./add-hotel.css']
})
export class AddHotelComponent implements OnInit { // הוסיפי implements OnInit

  newHotel = {
    title: '',
    location: '',
    description: '',
    type: '',
    pricePerNight: 0,
    maxGuests: 1,
    images: [] as string[],
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    rating: 5
  };

  constructor(
    private http: HttpClient,
    private informationService: Information,
    public authService: AuthService,
    private router: Router
  ) { }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    console.log('User data for form:', currentUser); // תבדקי ב-F12 מה השמות המדויקים של השדות

    if (currentUser) {
      // בדיקה אם קיים fullName או שילוב של שם פרטי ומשפחה
      this.newHotel.ownerName = currentUser.fullName ||
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
      this.newHotel.ownerEmail = currentUser.email || '';
      this.newHotel.ownerPhone = currentUser.phone || '';
    }
  }

  saveHotel() {
    // בדיקה בסיסית שהשדות חובה מלאים
    if (!this.newHotel.title || !this.newHotel.location) {
      Swal.fire('שים לב', 'חובה למלא שם מקום וכתובת', 'warning');
      return;
    }

    this.informationService.saveHotel(this.newHotel).subscribe({
      next: (savedHotel: any) => {
        Swal.fire('הצלחה!', 'הנכס נוסף למערכת בהצלחה', 'success');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Error saving hotel:', err);
        Swal.fire('שגיאה', 'לא הצלחנו לשמור את המלון בשרת', 'error');
      }
    });
  }

  resetForm() {
    this.newHotel = {
      title: '',
      location: '',
      description: '',
      type: '',
      pricePerNight: 0,
      maxGuests: 1,
      images: [] as string[], // הגדרת טיפוס ריק
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      rating: 5
    };

    // מילוי מחדש של פרטי המשתמש גם לאחר איפוס
    this.ngOnInit();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newHotel.images = [e.target.result];
      };
      reader.readAsDataURL(file);
    }
  }
}