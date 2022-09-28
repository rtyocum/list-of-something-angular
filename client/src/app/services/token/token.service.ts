import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TokenService {
    private token: BehaviorSubject<string | null>;
    tokenObservable: Observable<string | null>;
    constructor() {
        this.token = new BehaviorSubject<string | null>(null);
        this.tokenObservable = this.token.asObservable();
    }

    updateToken(token: string | null) {
        this.token.next(token);
    }
}
