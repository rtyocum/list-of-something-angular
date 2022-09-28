import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
    name: string;
    email: string;
    password: string;
    private menu: string | null;
    constructor(
        private authService: AuthService,
        private menuService: MenuService
    ) {
        this.name = '';
        this.email = '';
        this.password = '';
        this.menu = null;
        this.menuService.menuStateObservable.subscribe((e) => {
            this.menu = e.menu;
        });
    }

    ngOnInit(): void {}

    register(e: Event) {
        e.preventDefault();
        this.authService.register({
            name: this.name,
            email: this.email,
            password: this.password,
        });
        this.name = '';
        this.email = '';
        this.password = '';
    }

    isOpen() {
        return this.menu === 'register' ? true : false;
    }
}
