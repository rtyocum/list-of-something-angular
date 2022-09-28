import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ItemComponent } from './components/item/item.component';
import { ItemModalComponent } from './components/item-modal/item-modal.component';
import { ItemsComponent } from './components/items/items.component';
import { LoginComponent } from './components/login/login.component';
import { NavComponent } from './components/nav/nav.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from './components/users/users.component';

@NgModule({
    declarations: [
        AppComponent,
        ItemComponent,
        ItemModalComponent,
        ItemsComponent,
        LoginComponent,
        NavComponent,
        RegisterComponent,
        UsersComponent,
    ],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
