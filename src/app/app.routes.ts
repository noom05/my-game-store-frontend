import { Routes } from '@angular/router';

import { Dashboard } from './pages/user/dashboard/dashboard';
import { Detail } from './pages/user/detail/detail';
import { Login } from './pages/user/login/login';
import { Register } from './pages/user/register/register';
import { AddGame } from './pages/admin/add-game/add-game';
import { EditGame } from './pages/admin/edit-game/edit-game';
import { Profile } from './pages/user/profile/profile';
import { Wallet } from './pages/user/wallet/wallet';
import { History } from './pages/user/history/history';
import { Pagenotfound } from './pages/pagenotfound/pagenotfound';
import { EditProfile } from './pages/user/edit-profile/edit-profile';
import { AdminHistory } from './pages/admin/admin-history/admin-history';
import { Library } from './pages/user/library/library';
import { Cart } from './pages/user/cart/cart';
import { CreateDiscount } from './pages/admin/create-discount/create-discount';
import { DiscountList } from './pages/admin/discount-list/discount-list';
import { EditDiscount } from './pages/admin/edit-discount/edit-discount';
import { DiscountPage } from './pages/user/discount-page/discount-page';

export const routes: Routes = [
  // --- Main Routes ---
  { path: 'dashboard', component: Dashboard },
  { path: 'detail/:id', component: Detail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'add-game', component: AddGame },
  { path: 'edit-game/:id', component: EditGame },
  { path: 'profile', component: Profile },
  { path: 'edit-profile/:id', component: EditProfile },
  { path: 'wallet', component: Wallet },
  { path: 'history', component: History },
  { path: 'admin-history', component: AdminHistory },
  { path: 'library', component: Library },
  { path: 'cart', component: Cart },
  { path: 'create-discount', component: CreateDiscount },
  { path: 'discount-list', component: DiscountList },
  { path: 'edit-discount/:id', component: EditDiscount },
  { path: 'discount-page', component: DiscountPage },

  // --- Special Routes --
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', component: Pagenotfound },
];