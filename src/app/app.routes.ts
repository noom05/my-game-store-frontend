import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { Login } from './pages/login/login';
import { Detail } from './pages/detail/detail';
import { EditGame } from './pages/edit-game/edit-game';
import { AddGame } from './pages/add-game/add-game';
import { Register } from './pages/register/register';
import { Pagenotfound } from './pages/pagenotfound/pagenotfound';
import { Wallet } from './pages/wallet/wallet';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'detail/:id', component: Detail },
  { path: 'edit-game/:id', component: EditGame },
  { path: 'add-game', component: AddGame },
  { path: 'edit-profile', component: EditProfile },
  { path: '**', component: Pagenotfound },
  { path: 'wallet', component: Wallet },
];
