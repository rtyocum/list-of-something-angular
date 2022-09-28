import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    email: string;
    password: string;
    private menu: string | null;
    constructor(
        private authService: AuthService,
        private menuService: MenuService
    ) {
        this.email = '';
        this.password = '';
        this.menu = null;
        this.menuService.menuStateObservable.subscribe((e) => {
            this.menu = e.menu;
        });
    }

    ngOnInit(): void {}

    login(e: Event) {
        e.preventDefault();
        this.authService.login({ email: this.email, password: this.password });
        this.email = '';
        this.password = '';
    }

    isOpen() {
        return this.menu === 'login' ? true : false;
    }
}
