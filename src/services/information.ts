import { Injectable, inject, Injector } from '@angular/core'; // הוספנו inject ו-Injectorimport { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { Hotel } from '../class/hotel';
import { AuthService } from './auth'; // וודאי שהנתיב הזה נכון לקובץ ה-Auth שלך
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Information {
  private baseUrl = 'http://localhost:3000/api';
  private hotelsUrl = `${this.baseUrl}/hotels`;
  private favoritesUrl = `${this.baseUrl}/favorites`;
  private cartUrl = `${this.baseUrl}/cart`;

  public hotel: Hotel[] = [];
  public favorites: any[] = [];

  // פתרון הלולאה: אנחנו לא מזריקים את AuthService בקונסטרקטור
  constructor(private http: HttpClient) {
    this.refreshHotels();
  }

  // --- 🏨 ניהול מלונות ---
  
  refreshHotels(): void {
    this.getHotels().subscribe({
      next: (data) => {
        this.hotel = data;
      },
      error: (err) => console.error('שגיאה בטעינת מלונות:', err)
    });
  }

  getHotels(type?: string): Observable<any[]> {
    let url = this.hotelsUrl;
    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }
    return this.http.get<any[]>(url);
  }

  // תמיכה בשני השמות למניעת שגיאות בקומפוננטות שונות
  getPropertyById(id: string): Observable<any> {
    return this.http.get<any>(`${this.hotelsUrl}/${id}`);
  }

  getHotelById(id: string): Observable<any> {
    return this.getPropertyById(id);
  }

  saveHotel(newHotel: Hotel): Observable<Hotel> {
    const hotelToSave = {
      name: newHotel.title,
      description: newHotel.description,
      type: newHotel.type,
      priceBed: newHotel.pricePerNight,
      address: newHotel.location,
      pictures: newHotel.images, 
      maxGuests: newHotel.maxGuests,
      ownerName: newHotel.ownerName,
      ownerEmail: newHotel.ownerEmail,
      ownerPhone: newHotel.ownerPhone,
      rating: newHotel.rating || 5
    };
    return this.http.post<Hotel>(this.hotelsUrl, hotelToSave);
  }

  addHotel(hotel: any): Observable<any> {
    return this.http.post<any>(this.hotelsUrl, hotel);
  }

  deleteHotel(id: string): Observable<any> {
    return this.http.delete(`${this.hotelsUrl}/${id}`);
  }

  // --- ❤️ ניהול מועדפים (Favorites) ---
loadFavorites(userId?: string): void {
    // אנחנו משתמשים ב-localStorage ישירות כאן כדי למנוע תלות ב-Auth
const id = userId || localStorage.getItem('userId');    
    if (!id || id === 'guest') {
      this.favorites = [];
      return;
    }

    this.getFavorites(id).subscribe({
      next: (data) => {
        this.favorites = data;
      },
      error: (err) => console.error('Error loading favorites:', err)
    });
  }
  // פונקציה חכמה שטוענת מועדפים גם בלי שתעבירי לה ID (לוקחת לבד מה-Auth)
  

  getFavorites(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/${userId}`);
  }

isFavorite(propertyId: string): boolean {
    return this.favorites.some(f => f._id === propertyId || f === propertyId);
  }

  // פונקציה שמחליפה מצב (מוסיפה או מסירה) ומעדכנת את הרשימה
toggleFavorite(propertyId: string): Observable<any> {
const userId = localStorage.getItem('userId');    
    if (!userId || userId === 'guest') {
      alert('יש להתחבר כדי להוסיף למועדפים');
      return of(null);
    }

    const isFav = this.isFavorite(propertyId);

    if (isFav) {
      return this.http.delete(`${this.favoritesUrl}/${userId}/${propertyId}`).pipe(
        tap(() => {
           this.favorites = this.favorites.filter(f => f._id !== propertyId);
        })
      );
    } else {
      return this.http.post(this.favoritesUrl, { userId, propertyId }).pipe(
        tap(() => this.loadFavorites(userId))
      );
    }
  }

  // השארתי את הפונקציות הישנות למקרה שאת משתמשת בהן במקומות אחרים
  addToFavorites(userId: string, propertyId: string): Observable<any> {
    return this.http.post(this.favoritesUrl, { userId, propertyId }).pipe(
      tap(() => this.loadFavorites(userId))
    );
  }

  removeFromFavorites(userId: string, propertyId: string): Observable<any> {
    return this.http.delete(`${this.favoritesUrl}/${userId}/${propertyId}`).pipe(
      tap(() => {
        this.favorites = this.favorites.filter(f => f._id !== propertyId);
      })
    );
  }

  // --- 💬 ביקורות (Reviews) ---

  addReview(review: any): Observable<any> {
    return this.http.post(`${this.hotelsUrl}/reviews`, review);
  }

  getReviews(propertyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.hotelsUrl}/reviews/${propertyId}`);
  }

  // --- 🛒 סל קניות (Cart) ---

  getCart(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.cartUrl}/${userId}`);
  }

  addToCart(cartItem: any): Observable<any> {
    return this.http.post(this.cartUrl, cartItem);
  }

  removeFromCart(userId: string, propertyId: string): Observable<any> {
    return this.http.delete(`${this.cartUrl}/${userId}/${propertyId}`);
  }

  clearCart(userId: string): Observable<any> {
    return this.http.delete(`${this.cartUrl}/${userId}`);
  }

  // --- 👤 משתמשים ---

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${id}`);
  }
}