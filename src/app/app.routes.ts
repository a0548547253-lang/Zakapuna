import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { PropertyListComponent } from './components/property-list/property-list';
import { AddHotelComponent } from './components/add-hotel/add-hotel';
import { PropertyDetailsComponent } from './components/property-details/property-details';
import { AuthComponent } from './components/auth/auth';
import { About } from './components/about/about';
import { FavoritesComponent } from './components/favorites/favorites';
import { authGuard } from './components/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'listhotels', component: PropertyListComponent },
  { path: 'property/:id', component: PropertyDetailsComponent },
  { path: 'register', component: AuthComponent },
  { path: 'add-hotel', component: AddHotelComponent , canActivate: [authGuard]}, // וודא שגם כאן השם מעודכן
  { path: 'about', component: About},
  { path: 'favorites', component: FavoritesComponent },
  { path: '**', redirectTo: '' } 
];