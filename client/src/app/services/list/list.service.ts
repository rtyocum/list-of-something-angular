import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../token/token.service';
import {
    ADD_ITEM,
    DELETE_ALL_ITEMS,
    DELETE_ITEM,
    GET_ITEMS,
    ITEMS_LOADING,
} from '../types';

interface ListState {
    list: { id: number; item: string; createdBy: number }[];
    loading: boolean;
}

const initialState: ListState = {
    list: [],
    loading: false,
};

@Injectable({
    providedIn: 'root',
})
export class ListService {
    listStateObservable: Observable<ListState>;
    private listState: BehaviorSubject<ListState>;
    private token: string | null;
    constructor(private http: HttpClient, private tokenService: TokenService) {
        this.listState = new BehaviorSubject(initialState);
        this.listStateObservable = this.listState.asObservable();
        this.token = null;
        tokenService.tokenObservable.subscribe((e) => {
            this.token = e;
        });
    }

    getItems() {
        this.setItemsLoading();
        const items = this.http.get('api/items');
        this.updateStateObservable(items, GET_ITEMS, (err) => {});
    }

    addItem(item: string) {
        const newItem = this.http.post(
            'api/items',
            { item },
            {
                headers: {
                    Authorization: this.token ? `Bearer ${this.token}` : '',
                },
            }
        );
        this.updateStateObservable(newItem, ADD_ITEM, (err) => {});
    }

    deleteItem(id: Number) {
        const deletedItem = this.http.delete(`api/items/${id}`, {
            headers: {
                Authorization: this.token ? `Bearer ${this.token}` : '',
            },
        });
        this.updateStateObservable(deletedItem, DELETE_ITEM, (err) => {});
    }

    deleteAllItems() {
        const deletedItems = this.http.delete('api/items/@all', {
            headers: {
                Authorization: this.token ? `Bearer ${this.token}` : '',
            },
            responseType: 'text',
        });
        this.updateStateObservable(deletedItems, DELETE_ALL_ITEMS, (err) => {});
    }

    setItemsLoading() {
        this.updateState({ type: ITEMS_LOADING });
    }
    private getCurrentState(): ListState {
        return this.listState.getValue();
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
        const getState = (): ListState => {
            switch (action.type) {
                case GET_ITEMS:
                    return {
                        loading: false,
                        list: action.payload.list,
                    };
                case ADD_ITEM:
                    return {
                        ...this.getCurrentState(),
                        list: [...this.getCurrentState().list, action.payload],
                    };
                case DELETE_ITEM:
                    return {
                        ...this.getCurrentState(),
                        list: this.getCurrentState().list.filter((e: any) => {
                            return e.id !== action.payload.item.id;
                        }),
                    };
                case DELETE_ALL_ITEMS:
                    return {
                        ...this.getCurrentState(),
                        list: [],
                    };
                case ITEMS_LOADING:
                    return {
                        ...this.getCurrentState(),
                        loading: true,
                    };
                default:
                    return this.getCurrentState();
            }
        };
        this.listState.next(getState());
    }
}
