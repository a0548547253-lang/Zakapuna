import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Information } from '../../../services/information';
import { Hotel } from '../../../class/hotel';
import { AuthService } from '../../../services/auth';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css'],
  animations: [
    trigger('fadeOut', [
      // האנימציה שקורית כשהאלמנט נוצר (כניסה)
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      // האנימציה שקורית כשהאלמנט מושמד (יציאה)
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.98)' }))
      ])
    ])
  ]
})
export class PropertyDetailsComponent implements OnInit {

  @ViewChild('imageSlider') imageSlider!: ElementRef;

  property?: Hotel;
  reviews: any[] = [];
  newReviewText: string = '';
  cart: any[] = [];

  // משתנים למניעת לחיצות כפולות
  isAddingToCart = false;
  isTogglingFavorite = false;

  constructor(
    private viewportScroller: ViewportScroller, // הזרקת השירות
    private route: ActivatedRoute,
    private router: Router,
    public ser: Information, // public כדי שה-HTML יוכל לגשת אליו במידת הצורך
    public authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    this.viewportScroller.scrollToPosition([0, 0]);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // 1. טעינת פרטי הנכס
      this.ser.getPropertyById(id).subscribe({
        next: (data) => {
          this.property = data;
          if (this.property && this.property._id) {
            this.loadReviews(this.property._id);
          }
        },
        error: (err) => console.error('Error fetching property:', err)
      });
    }

    // 2. טעינת מועדפים ועגלה (הסרוויס מטפל ביוזר לבד)
    this.ser.loadFavorites();
    this.loadCart();
  }

  // --- פונקציות עזר ויזואליות ---

  getMapEmbedUrl(location: string): SafeResourceUrl {
    const encodedLoc = encodeURIComponent(location);
    const url = `https://maps.google.com/maps?q=${encodedLoc}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollSlider(px: number) {
    this.imageSlider.nativeElement.scrollBy({ left: px, behavior: 'smooth' });
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  // --- ביקורות (Reviews) ---

  loadReviews(id: string) {
    this.ser.getReviews(id).subscribe({
      next: (reviews: any[]) => this.reviews = reviews,
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  addReview() {
    // בדיקות תקינות
    if (!this.newReviewText.trim() || !this.property?._id) return;

    // קבלת משתמש מה-AuthService
    const user = this.authService.getCurrentUser();

    if (!user) {
      alert('עליך להתחבר כדי לכתוב ביקורת');
      return;
    }

    // בניית אובייקט הביקורת
    const newRev = {
      propertyId: this.property._id,
      userName: user.fullName || user.firstName,
      text: this.newReviewText,
      date: new Date()
    };

    // שליחה לשרת (החלק שהיה חסר לך)
    this.ser.addReview(newRev).subscribe({
      next: (savedReview: any) => {
        this.reviews.unshift(savedReview); // הוספה לרשימה המקומית
        this.newReviewText = ''; // ניקוי השדה
        alert('הביקורת נוספה בהצלחה! ⭐');
      },
      error: (err) => {
        console.error('Error adding review:', err);
        alert('שגיאה בהוספת הביקורת');
      }
    });
  }

  // --- מועדפים (Favorites) ---

  toggleFavorite(id: string) {
    if (this.isTogglingFavorite) return;
    this.isTogglingFavorite = true;

    // שימוש בפונקציה החדשה בסרביס שמטפלת בהכל
    this.ser.toggleFavorite(id).subscribe({
      next: () => {
        this.isTogglingFavorite = false;
        // אין צורך לעדכן מערך מקומי, הפונקציה isFavorite בודקת מול הסרוויס
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
        this.isTogglingFavorite = false;
      }
    });
  }

  isFavorite(id: string): boolean {
    return this.ser.isFavorite(id);
  }

  // --- עגלה (Cart) ---

  loadCart() {
    const userId = this.authService.getCurrentUserId();
    if (userId === 'guest') return;

    this.ser.getCart(userId).subscribe({
      next: (cart: any[]) => this.cart = cart,
      error: (err) => console.error('Cart error:', err)
    });
  }

  addToCart() {
    if (!this.property || this.isAddingToCart) return;

    const userId = this.authService.getCurrentUserId();

    if (userId === 'guest') {
      alert('יש להתחבר כדי להוסיף לסל');
      return;
    }

    this.isAddingToCart = true;

    const cartItem = {
      userId,
      propertyId: this.property._id,
      propertyTitle: this.property.title,
      pricePerNight: this.property.pricePerNight,
      image: this.property.images ? this.property.images[0] : '',
      addedAt: new Date()
    };

    this.ser.addToCart(cartItem).subscribe({
      next: () => {
        this.cart.push(cartItem);
        alert('הנכס נוסף לסל! 🎉');
        this.isAddingToCart = false;
      },
      error: (err) => {
        console.error('Cart error:', err);
        alert('שגיאה בהוספה לסל');
        this.isAddingToCart = false;
      }
    });
  }

  isInCart(): boolean {
    return this.cart.some(item => item.propertyId === this.property?._id);
  }
  formatImageUrl(url: string | undefined): string {
    if (!url) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

    // אם זו תמונה שהועלתה (מתחילה ב-data:image) - תחזיר אותה כמו שהיא
    if (url.startsWith('data:image')) {
      return url;
    }

    // אם ה-URL הוא מזהה של Unsplash בלבד
    if (url.startsWith('photo-')) {
      return `https://images.unsplash.com/${url}`;
    }

    return url;
  }
}

