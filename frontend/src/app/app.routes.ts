import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DocumentsComponent } from './pages/documents/documents.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
