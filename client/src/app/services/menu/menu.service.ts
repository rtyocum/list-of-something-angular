import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { CLOSE_MENU, OPEN_LOGIN, OPEN_REGISTER } from '../types';

interface MenuState {
    menu: string | null;
}

const initialState: MenuState = {
    menu: null,
};

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    menuStateObservable: Observable<MenuState>;
    private menuState: BehaviorSubject<MenuState>;
    constructor() {
        this.menuState = new BehaviorSubject(initialState);
        this.menuStateObservable = this.menuState.asObservable();
    }

    openLogin() {
        this.updateState({ type: OPEN_LOGIN });
    }

    openRegister() {
        this.updateState({ type: OPEN_REGISTER });
    }

    closeMenu() {
        this.updateState({ type: CLOSE_MENU });
    }

    private getCurrentState(): MenuState {
        return this.menuState.getValue();
    }

    private updateState(action: { type: string; payload?: any }): void {
        const getState = (): MenuState => {
            switch (action.type) {
                case OPEN_LOGIN:
                    return {
                        menu: 'login',
                    };
                case OPEN_REGISTER:
                    return {
                        menu: 'register',
                    };
                case CLOSE_MENU:
                    return {
                        menu: null,
                    };
                default:
                    return this.getCurrentState();
            }
        };
        this.menuState.next(getState());
    }
}
