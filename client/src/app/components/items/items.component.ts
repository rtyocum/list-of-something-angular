import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ListService } from 'src/app/services/list/list.service';
import { User } from 'src/app/services/types';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.css'],
})
export class ItemsComponent implements OnInit {
    private authenticated: boolean;
    private user: User | null;
    newItem: string;
    private items: { id: number; item: string; createdBy: number }[];
    private loading: boolean;
    constructor(
        private authService: AuthService,
        private listService: ListService,
        private titleService: Title
    ) {
        this.authenticated = false;
        this.user = null;
        this.newItem = '';
        this.items = [];
        this.loading = false;
        this.titleService.setTitle('List of Something');
        this.authService.authStateObservable.subscribe((e) => {
            this.authenticated = e.isAuthenticated;
            this.user = e.user ? e.user : null;
        });
        this.listService.listStateObservable.subscribe((e) => {
            this.items = e.list;
            this.loading = e.loading;
        });
        this.listService.getItems();
    }

    ngOnInit(): void {}

    addItem(e: Event) {
        e.preventDefault();
        this.listService.addItem(this.newItem);
        this.newItem = '';
    }

    deleteAllItems(e: Event) {
        e.preventDefault();
        this.listService.deleteAllItems();
    }

    getUser(): User | null {
        return this.user;
    }

    getItems(): { id: number; item: string; createdBy: number }[] {
        return this.items;
    }

    isLoading(): boolean {
        return this.loading;
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    hasPermissionLevel(permissionLevel: number): boolean {
        if (!this.user) return false;
        return this.user.permissionLevel & permissionLevel && this.authenticated
            ? true
            : false;
    }
}
