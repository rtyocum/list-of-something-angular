import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { MenuService } from '../menu/menu.service';
import { TokenService } from '../token/token.service';
import {
    AUTH_ERROR,
    LOGIN_FAILED,
    LOGIN_SUCCESS,
    LOGOUT_SUCCESS,
    REGISTER_FAILED,
    REGISTER_SUCCESS,
    USER_LOADED,
    USER_LOADING,
} from '../types';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    user?: {
        id: number;
        name: string;
        email: string;
        permissionLevel: number;
    };
}

interface Payload {
    access_token: string;
    user: {
        id: number;
        name: string;
        email: string;
        permissionLevel: number;
    };
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    loading: false,
};

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private authState: BehaviorSubject<AuthState>;
    authStateObservable: Observable<AuthState>;
    constructor(
        private http: HttpClient,
        private menuService: MenuService,
        private tokenService: TokenService
    ) {
        this.authState = new BehaviorSubject(initialState);
        this.authStateObservable = this.authState.asObservable();
    }

    loadUser() {
        this.setUserLoading();
        const user = this.http.post<Payload>('auth/token', {});

        this.updateStateObservable(user, USER_LOADED, (err) =>
            this.updateState({ type: AUTH_ERROR })
        );
    }

    login({ email, password }: { email: string; password: string }) {
        this.setUserLoading();
        const user = this.http.post<Payload>('auth/login', {
            email,
            password,
        });
        this.updateStateObservable(user, LOGIN_SUCCESS, (err) =>
            this.updateState({ type: LOGIN_FAILED })
        );
        this.menuService.closeMenu();
    }

    register({
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    }) {
        this.setUserLoading();
        const user = this.http.post<Payload>('auth/register', {
            name,
            email,
            password,
        });
        this.updateStateObservable(user, REGISTER_SUCCESS, (err) =>
            this.updateState({ type: REGISTER_FAILED })
        );
        this.menuService.closeMenu();
    }

    logout() {
        this.setUserLoading();
        const res = this.http.post('auth/logout', {});
        this.updateStateObservable(res, LOGOUT_SUCCESS, (err) => {});
    }

    setUserLoading() {
        this.updateState({ type: USER_LOADING });
    }

    private getCurrentState(): AuthState {
        return this.authState.getValue();
    }

    private updateStateObservable(
        observable: Observable<any>,
        type: string,
        error: (err: any) => void
    ) {
        observable.pipe(first()).subscribe({
            next: (res) => {
                const state = this.updateState({ type, payload: res });
            },
            error,
        });
    }

    private updateState(action: { type: string; payload?: Payload }): void {
        const getState = (): AuthState => {
            switch (action.type) {
                case USER_LOADING:
                    return {
                        ...this.getCurrentState(),
                        loading: true,
                    };
                case USER_LOADED:
                case LOGIN_SUCCESS:
                case REGISTER_SUCCESS:
                    return {
                        token: action.payload
                            ? action.payload.access_token
                            : null,
                        isAuthenticated: true,
                        loading: false,
                        user: action.payload ? action.payload.user : undefined,
                    };

                case LOGIN_FAILED:
                case REGISTER_FAILED:
                case LOGOUT_SUCCESS:
                case AUTH_ERROR:
                    return {
                        token: null,
                        isAuthenticated: false,
                        loading: false,
                        user: undefined,
                    };
                default:
                    return this.getCurrentState();
            }
        };
        const state = getState();
        this.tokenService.updateToken(state.token);
        this.authState.next(state);
    }
}
