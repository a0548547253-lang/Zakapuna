import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// אפשר להשאיר את הייבואים, הם לא מפריעים
import { Property } from '../../models/property';
import { Hotel } from '../../../class/hotel';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-card.html',
  styleUrl: './hotel-card.css'
})
export class HotelCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) image!: string;
  @Input({ required: true }) pricePerNight!: number;
  @Input({ required: true }) location!: string;
  @Input({ required: true }) rating!: number;
  
  // --- התיקון כאן ---
  // משנים ל-any כדי שהוא יקבל גם Property וגם Hotel בלי לצעוק
  @Input() hotel?: any; 
  // ------------------

  constructor(private router: Router) {}

  toggleDetails(event: any): void { 
    if (event) event.stopPropagation();
    
    // ה-any מאפשר לגשת ל-_id בלי שגיאות אדומות
    if (this.hotel && this.hotel._id) {
      this.router.navigate(['/property', this.hotel._id]);
    } else {
      console.error("Property ID is missing!", this.hotel);
    }
  }

get cleanImage(): string {
  if (!this.image) return 'https://via.placeholder.com/400x300';
  
  // אם זו תמונה שהועלתה מהמחשב, אל תיגע בה
  if (this.image.startsWith('data:image')) return this.image;

  // תיקון ה-https רק אם זה באמת נחוץ
  if (this.image.startsWith('ttps://')) return 'h' + this.image;
  
  return this.image;
}
}