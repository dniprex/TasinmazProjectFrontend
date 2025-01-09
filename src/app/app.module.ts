import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnaMenuComponent } from './ana-menu/ana-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { AddTasinmazComponent } from './add-tasinmaz/add-tasinmaz.component';
import { TasinmazlarComponent } from './tasinmazlar/tasinmazlar.component';
import { FormsModule } from '@angular/forms';
import { EditTasinmazComponent } from './edit-tasinmaz/edit-tasinmaz.component';
@NgModule({
  declarations: [
    AppComponent,
    AnaMenuComponent,
    AddTasinmazComponent,
    TasinmazlarComponent,
    EditTasinmazComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
