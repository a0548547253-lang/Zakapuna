import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Information } from '../../../services/information';
import { Property } from '../../models/property';
import { HotelCardComponent } from '../hotel-card/hotel-card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // הוספה לשימוש בחיפוש
import Fuse from 'fuse.js'; // ייבוא הבוט לחיפוש חכם

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, HotelCardComponent, RouterModule, FormsModule], // הוספנו FormsModule
  templateUrl: './property-list.html',
  styleUrls: ['./property-list.css']
})
export class PropertyListComponent implements OnInit {
  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  selectedType: string = 'all';
  
  // משתנים חדשים לחיפוש החכם
  searchTerm: string = '';
  fuse: any;

  constructor(
    private information: Information,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 PropertyListComponent נטען');
    
    this.information.getHotels().subscribe({
      next: (data) => {
        this.allProperties = data;
        console.log('📦 כל הנכסים:', data);
        
        // אתחול הבוט לחיפוש חכם ברגע שהנתונים נטענים
        this.initSmartSearch();

        this.route.queryParamMap.subscribe(params => {
          const typeFromUrl = params.get('type');
          console.log('🔗 Type מה-URL:', typeFromUrl);
          
          this.applyFilterFromUrl(typeFromUrl);
        });
      },
      error: (err) => console.error('❌ שגיאה בטעינת נתונים:', err)
    });
  }

  // הגדרת הבוט לחיפוש חכם
  private initSmartSearch(): void {
    const options = {
      keys: ['title', 'location', 'type'], // השדות שבהם הבוט יחפש
      threshold: 0.4, // רמת "גמישות" בחיפוש (0.4 מאפשר טעויות כתיב קלות)
      distance: 100
    };
    this.fuse = new Fuse(this.allProperties, options);
  }

  navigateToHome(): void {
    console.log('🏠 חוזר לעמוד הבית...');
    this.router.navigate(['/']);
  }

  // פונקציית החיפוש החכם שתופעל בלחיצה על כפתור Search
  performSmartSearch(): void {
    if (!this.searchTerm.trim()) {
      this.applyFilterFromUrl(this.selectedType); // חזרה לסינון הרגיל אם החיפוש ריק
      return;
    }

    const results = this.fuse.search(this.searchTerm);
    this.filteredProperties = results.map((result: any) => result.item);
    
    console.log(`🤖 חיפוש חכם עבור "${this.searchTerm}" מצא ${this.filteredProperties.length} תוצאות`);
  }

  private normalizeType(type: string): string {
    return type.toLowerCase().replace(/[-\s]/g, '');
  }

  private applyFilterFromUrl(typeFromUrl: string | null): void {
    if (!typeFromUrl || typeFromUrl === 'all') {
      this.selectedType = 'all';
      this.filteredProperties = [...this.allProperties];
      console.log('✅ מציג הכל');
      return;
    }

    const normalizedUrlType = this.normalizeType(typeFromUrl);
    
    this.filteredProperties = this.allProperties.filter(item => {
      if (!item.type) return false;
      const normalizedDbType = this.normalizeType(item.type);
      return normalizedDbType === normalizedUrlType;
    });

    this.selectedType = typeFromUrl;
  }

  applyFilter(type: string): void {
    console.log('🎯 סינון ידני:', type);
    this.searchTerm = ''; // איפוס החיפוש כשלוחצים על קטגוריה
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: type === 'all' ? null : type },
      queryParamsHandling: 'merge'
    });
  }
}