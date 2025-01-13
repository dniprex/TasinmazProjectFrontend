import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnaMenuComponent } from './ana-menu/ana-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { AddTasinmazComponent } from './add-tasinmaz/add-tasinmaz.component';
import { TasinmazlarComponent } from './tasinmazlar/tasinmazlar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditTasinmazComponent } from './edit-tasinmaz/edit-tasinmaz.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { UserService } from './services/user.service';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
@NgModule({
  declarations: [
    AppComponent,
    AnaMenuComponent,
    AddTasinmazComponent,
    TasinmazlarComponent,
    EditTasinmazComponent,
    LoginComponent,
    UsersComponent,
    AddUserComponent,
    EditUserComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([])
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
