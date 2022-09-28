import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-item-modal',
    templateUrl: './item-modal.component.html',
    styleUrls: ['./item-modal.component.css'],
})
export class ItemModalComponent implements OnInit {
    @Input() isOpen = false;

    constructor(private menuService: MenuService) {}

    ngOnInit(): void {}

    closeMenu() {
        this.menuService.closeMenu();
    }
}
