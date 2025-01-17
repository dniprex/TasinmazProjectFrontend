import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnaMenuComponent } from './ana-menu/ana-menu.component';
import { AddTasinmazComponent } from './add-tasinmaz/add-tasinmaz.component';
import { EditTasinmazComponent } from './edit-tasinmaz/edit-tasinmaz.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { LogComponent } from './log/log.component';
import { MapComponent } from './map/map.component';
const routes: Routes = [
  { path: "", redirectTo: '/login', pathMatch: 'full' },
  { path: "login", component: LoginComponent },
  { path: 'ana-menu', component: AnaMenuComponent },
  { path: 'add-tasinmaz', component: AddTasinmazComponent },
  { path: 'edit-tasinmaz/:id', component: EditTasinmazComponent },
  { path: "users", component: UsersComponent },
  { path: 'add-user', component: AddUserComponent },
  { path: 'edit-user/:id', component: EditUserComponent },
  { path: 'log', component: LogComponent },
  { path: 'map', component: MapComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
