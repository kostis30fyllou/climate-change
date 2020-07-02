import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found.component';

export const APP_ROUTES: Routes = [
  { path: '', loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'video', loadChildren: () => import('./video/video.module').then(m => m.VideoModule) },
  { path: '**', component: NotFoundComponent },
];
