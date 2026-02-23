import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // הוספת ייבוא תקין של Location
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth'; 
import { Information } from '../../../services/information';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  isLoginMode = true; 
  errorMsg = '';

  userForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location,
    public information: Information 
  ) { }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  // חזרה לדף הקודם
  goBack() {
    this.location.back();
  }

onRegister() {
  if (this.userForm.password !== this.userForm.confirmPassword) {
    this.errorMsg = 'הסיסמאות אינן זהות!';
    return;
  }

  const payload = {
    email: this.userForm.email.trim().toLowerCase(),
    password: this.userForm.password,
    fullName: `${this.userForm.firstName} ${this.userForm.lastName}`,
    phone: this.userForm.phone,    // הוספתי את זה כדי שהמידע ישמר ב-DB
    address: this.userForm.address // הוספתי את זה כדי שהמידע ישמר ב-DB
  };

  this.authService.signup(payload).subscribe({
    next: () => {
      // במקום רק להראות הודעה, אנחנו מפעילים את פונקציית ההתחברות
      // השתמשנו בפרטים שהמשתמש הרגע הזין בטופס
      this.onLogin(); 
      
      Swal.fire({
        title: 'נרשמת בהצלחה!',
        text: 'מערכת Zakapuna מחברת אותך פנימה...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (err) => {
      this.errorMsg = err.error.message || 'שגיאה ברישום';
    }
  });
}

onLogin() {
  const credentials = {
    email: this.userForm.email.trim().toLowerCase(),
    password: this.userForm.password
  };

  this.authService.login(credentials).subscribe({
    next: (res: any) => {
      // 1. שמירת ה-ID בנפרד למניעת שגיאות בסרוויס המידע
      localStorage.setItem('userId', res.user.userId || res.user._id);

      // 2. עדכון המועדפים באופן מיידי
      this.information.loadFavorites(res.user.userId || res.user._id);

      // 3. הצגת הודעת הצלחה
      Swal.fire({
        title: 'ברוך הבא!',
        text: `שלום, ${res.user.fullName}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      // 4. ריקון הטופס כדי שהפרטים לא יישארו בכניסה הבאה
      this.resetForm();

      // 5. ניווט לדף הבית (השהיה קלה כדי שיראו את ההודעה)
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    },
    error: (err) => {
      // הודעת שגיאה במידה והפרטים לא נכונים
      this.errorMsg = 'אימייל או סיסמה שגויים. אם אין לך חשבון, יש ליצור אחד.';
    }
  });
}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMsg = '';
    this.resetForm();
  }

  private resetForm() {
    this.userForm = {
      firstName: '', lastName: '', email: '', phone: '',
      address: '', password: '', confirmPassword: ''
    };
  }
}