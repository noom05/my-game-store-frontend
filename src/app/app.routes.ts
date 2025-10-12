import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Detail } from './pages/detail/detail';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AddGame } from './pages/add-game/add-game';
import { EditGame } from './pages/edit-game/edit-game';
import { Profile } from './pages/profile/profile';
import { Wallet } from './pages/wallet/wallet';
import { History } from './pages/history/history';
import { Pagenotfound } from './pages/pagenotfound/pagenotfound';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { AdminHistory } from './pages/admin-history/admin-history';

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
    { path: 'admin-history', component: AdminHistory},

    // --- Special Routes --
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', component: Pagenotfound }
];

