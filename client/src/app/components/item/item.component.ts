import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ListService } from 'src/app/services/list/list.service';
import { User } from 'src/app/services/types';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
    @Input() id = 0;
    @Input() item = '';
    @Input() createdBy = 0;
    private user: User | null;

    constructor(
        private authService: AuthService,
        private listService: ListService
    ) {
        this.user = null;
        this.authService.authStateObservable.subscribe(
            (e) => (this.user = e.user ? e.user : null)
        );
    }

    ngOnInit(): void {}

    ifDelete(): boolean {
        if (!this.user) return false;
        return this.user.permissionLevel & 24 || this.createdBy === this.user.id
            ? true
            : false;
    }

    deleteItem() {
        this.listService.deleteItem(this.id);
    }

    getUser() {
        return this.user;
    }
}
