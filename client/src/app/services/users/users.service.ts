import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { TokenService } from '../token/token.service';
import {
    ADD_USER,
    DELETE_USER,
    GET_USERS,
    UPDATE_USER,
    User,
    USERS_LOADING,
} from '../types';

type UsersState = {
    loading: boolean;
    users: User[];
};

const initialState: UsersState = {
    loading: false,
    users: [],
};

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    usersStateObservable: Observable<UsersState>;
    private usersState: BehaviorSubject<UsersState>;
    private token: string | null;
    constructor(private tokenService: TokenService, private http: HttpClient) {
        this.usersState = new BehaviorSubject(initialState);
        this.usersStateObservable = this.usersState.asObservable();
        this.token = null;
        this.tokenService.tokenObservable.subscribe((e) => (this.token = e));
    }

    getUsers() {
        const users = this.http.get('api/users', {
            headers: {
                Authorization: this.token ? `Bearer ${this.token}` : '',
            },
        });
        this.updateStateObservable(users, GET_USERS, (err) => console.log(err));
    }

    addUser(
        name: string,
        email: string,
        password: string,
        permissionLevel: number
    ) {
        const newUser = this.http.post(
            'api/users',
            {
                name,
                email,
                password,
                permissionLevel,
            },
            {
                headers: {
                    Authorization: this.token ? `Bearer ${this.token}` : '',
                },
            }
        );
        this.updateStateObservable(newUser, ADD_USER, (err) =>
            console.log(err)
        );
    }

    updateUser(data: {
        id: number;
        name?: string;
        email?: string;
        password?: string;
        permissionLevel?: number;
    }) {
        const newUser = this.http.put('api/users', data, {
            headers: {
                Authorization: this.token ? `Bearer ${this.token}` : '',
            },
        });
        this.updateStateObservable(newUser, UPDATE_USER, (err) =>
            console.log(err)
        );
    }

    deleteUser(id: number) {
        const deletedUser = this.http.delete(`api/users/${id}`, {
            headers: {
                Authorization: this.token ? `Bearer ${this.token}` : '',
            },
        });
        this.updateStateObservable(deletedUser, DELETE_USER, (err) =>
            console.log(err)
        );
    }

    setUsersLoading() {
        this.updateState({ type: USERS_LOADING });
    }

    private getCurrentState(): UsersState {
        return this.usersState.getValue();
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

    private updateState(action: { type: string; payload?: any }): void {
        const getState = (): UsersState => {
            const currentState = this.getCurrentState();
            switch (action.type) {
                case GET_USERS:
                    return {
                        loading: false,
                        users: action.payload,
                    };
                case ADD_USER:
                    return {
                        loading: currentState.loading,
                        users: [...currentState.users, action.payload],
                    };
                case UPDATE_USER:
                    return {
                        loading: currentState.loading,
                        users: currentState.users.map((e) => {
                            if (action.payload.id === e.id) {
                                return action.payload;
                            }
                            return e;
                        }),
                    };
                case DELETE_USER:
                    return {
                        loading: currentState.loading,
                        users: currentState.users.filter(
                            (e) => e.id !== action.payload.id
                        ),
                    };

                case USERS_LOADING:

                default:
                    return currentState;
            }
        };
        this.usersState.next(getState());
    }
}
