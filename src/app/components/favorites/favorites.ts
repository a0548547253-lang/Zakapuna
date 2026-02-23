import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Information } from '../../../services/information';
import { AuthService } from '../../../services/auth'; 

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = []; // המערך שיציג את הנתונים ב-HTML
  isLoading: boolean = true;

  constructor(
    public ser: Information,   // הזרקת השירות (שימוש ב-public מאפשר גישה מה-HTML אם צריך)
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites() {
    const userId = this.auth.getUserId();
    
    if (!userId || userId === 'guest') {
      this.isLoading = false;
      this.favorites = [];
      return;
    }

    this.isLoading = true;
    this.ser.getFavorites(userId).subscribe({
      next: (data: any[]) => {
        // המרת הנתונים במידה והשרת מחזיר מבנה שונה (למשל images במקום image)
        this.favorites = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('שגיאה בטעינת המועדפים:', err);
        this.isLoading = false;
      }
    });
  }

  removeFavorite(propertyId: string, event: Event) {
    event.stopPropagation(); // מונע מעבר לדף הנכס כשלוחצים על כפתור המחיקה
    
    const userId = this.auth.getUserId();
    if (!userId) return;

    // קריאה לשרת למחיקה פיזית מה-DB
    this.ser.removeFromFavorites(userId, propertyId).subscribe({
      next: () => {
        // רק אחרי שהמחיקה הצליחה בשרת, נעדכן את התצוגה אצלנו
        this.favorites = this.favorites.filter(p => p._id !== propertyId);
        
        // עדכון אופציונלי של המערך בתוך ה-Service כדי לשמור על סנכרון
        this.ser.favorites = this.favorites;
      },
      error: (err) => {
        console.error('הסרה נכשלה:', err);
      }
    });
  }

  viewProperty(id: string) {
    this.router.navigate(['/property', id]);
  }

  goBack() {
    this.router.navigate(['/listhotels']);
  }

  removeFav(id: string, event: Event) {
  // מונע מהאירוע "לבעבע" למעלה ולפתוח את דף הנכס
  event.stopPropagation(); 

  const userId = this.auth.getUserId();
  
  if (!userId || userId === 'guest') {
    console.warn('משתמש לא מחובר לא יכול להסיר מועדפים');
    return;
  }

  // שליחת בקשת ה-Delete לשרת דרך השירות
  this.ser.removeFromFavorites(userId, id).subscribe({
    next: () => {
      // עדכון המערך המקומי כדי שהכרטיס ייעלם מהמסך מיד
      this.favorites = this.favorites.filter(p => p._id !== id);
      
      // אם ה-HTML שלך מציג את ser.favorites, השירות כבר מעדכן אותו בתוך ה-tap
      console.log('הנכס הוסר בהצלחה מהמועדפים');
    },
    error: (err) => {
      console.error('שגיאה בהסרת המועדף:', err);
    }
  });
}
}