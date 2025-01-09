import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnaMenuComponent } from './ana-menu/ana-menu.component';
import { AddTasinmazComponent } from './add-tasinmaz/add-tasinmaz.component';
import { EditTasinmazComponent } from './edit-tasinmaz/edit-tasinmaz.component';
const routes: Routes = [
  { path: '', component: AnaMenuComponent }, 
  { path: 'add-tasinmaz', component: AddTasinmazComponent },
  { path: 'edit-tasinmaz/:id', component: EditTasinmazComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
