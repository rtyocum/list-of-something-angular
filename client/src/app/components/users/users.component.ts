import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/services/types';
import { UsersService } from 'src/app/services/users/users.service';

interface ModifyUser extends User {
    password?: string;
}

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
    private permissionLevel: number;
    private authLoading: boolean;
    private users: { loading: boolean; users: ModifyUser[] };
    private addUserFields: boolean;
    newUser: {
        name: string;
        email: string;
        password: string;
        permissionLevel: number;
    };
    private editable: number | null;
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
        private titleService: Title
    ) {
        this.permissionLevel = 0;
        this.authLoading = false;
        this.users = { loading: false, users: [] };
        this.addUserFields = false;
        this.newUser = {
            name: '',
            email: '',
            password: '',
            permissionLevel: 0,
        };
        this.editable = null;
        this.titleService.setTitle('List of Something | Users');
        this.usersService.usersStateObservable.subscribe((e) => {
            this.users = e;
        });
        this.authService.authStateObservable.subscribe((e) => {
            this.permissionLevel = e.user ? e.user.permissionLevel : 0;
            this.authLoading = e.loading;
            if (!this.authLoading && !(this.permissionLevel & 24)) {
                this.router.navigate(['/']);
            } else if (!this.authLoading && this.permissionLevel & 24) {
                this.usersService.getUsers();
            }
        });
    }

    ngOnInit(): void {}

    addUser() {
        if (
            !this.newUser.name ||
            !this.newUser.email ||
            !this.newUser.password
        ) {
            return;
        }
        this.usersService.addUser(
            this.newUser.name,
            this.newUser.email,
            this.newUser.password,
            this.newUser.permissionLevel
        );
        this.addUserFields = false;
    }

    addIfEnter(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            this.addUser();
        }
    }

    deleteUser(id: number) {
        this.usersService.deleteUser(id);
    }

    isLoading() {
        return this.users.loading;
    }

    isAuthLoading() {
        return this.authLoading;
    }

    getUsers() {
        return this.users;
    }

    editUser(id: number) {
        this.editable = id;
    }

    getEditable(id: number) {
        return id === this.editable;
    }

    saveEdit(user: User) {
        this.editable = null;
        this.usersService.updateUser(user);
    }

    cancelEdit() {
        this.editable = null;
        this.usersService.getUsers();
    }

    saveIfEnter(e: KeyboardEvent, user: User) {
        if (e.key === 'Enter') {
            this.saveEdit(user);
        }
    }

    addUserFieldsIsOpen() {
        return this.addUserFields;
    }

    closeAddUserFields() {
        this.addUserFields = false;
        this.newUser = {
            name: '',
            email: '',
            password: '',
            permissionLevel: 0,
        };
    }

    openAddUserFields() {
        this.addUserFields = true;
    }
}
