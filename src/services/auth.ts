import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Information } from "./information"; 
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject שומר את מצב המשתמש ומשדר אותו לכל האתר בזמן אמת
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private ser: Information,
    private http: HttpClient
  ) {
    this.initUser();
  }

  private initUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      
      // אם יש למשתמש ID, נטען את המועדפים שלו
      const userId = user.userId || user._id;
      if (userId) {
        this.ser.loadFavorites(userId);
      }
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/auth/login', credentials).pipe(
      tap((res: any) => {
        if (res && res.user) {
          // 1. שמירה ב-localStorage
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          localStorage.setItem('userId', res.user.userId || res.user._id);
          // 2. עדכון ה-Subject - זה מה שגורם לאתר "להתעורר"
          this.currentUserSubject.next(res.user);

          // 3. טעינת המועדפים של המשתמש שהתחבר כרגע
          const userId = res.user.userId || res.user._id;
          if (userId) {
            this.ser.loadFavorites(userId);
          }
        }
      })
    );
  }

  signup(userData: any) {
    return this.http.post('http://localhost:3000/api/auth/signup', userData);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.ser.favorites = []; // איפוס מועדפים ביציאה
    this.router.navigate(['/']);
  }

  // מחזיר את המשתמש הנוכחי (גרסה סינכרונית)
  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  // מחזיר את ה-ID של המשתמש המחובר או 'guest'
  getCurrentUserId(): string {
    const user = this.currentUserSubject.value;
    return user?.userId || user?._id || 'guest';
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // פונקציה תומכת לקוד הישן שלך אם צריך
  getUserId() {
    return this.getCurrentUserId();
  }
}