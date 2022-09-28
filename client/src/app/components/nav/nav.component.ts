import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { User } from 'src/app/services/types';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
    private user: User | null;
    private authenticated: boolean;
    constructor(
        private authService: AuthService,
        private menuService: MenuService,
        private router: Router
    ) {
        this.user = null;
        this.authenticated = false;
        this.authService.authStateObservable.subscribe((e) => {
            this.user = e.user ? e.user : null;
            this.authenticated = e.isAuthenticated;
        });
    }

    openLogin() {
        this.menuService.openLogin();
    }

    openRegister() {
        this.menuService.openRegister();
    }

    logout() {
        this.authService.logout();
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return this.authenticated;
    }

    isAdmin() {
        if (this.user?.permissionLevel && this.user.permissionLevel & 24)
            return true;
        return false;
    }

    onUsersPage() {
        return this.router.url === '/users';
    }

    ngOnInit(): void {}
}
