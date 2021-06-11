import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";



@Component({
  selector: 'modal-search-desk',
  templateUrl: './desk-list.component.html',
  styleUrls: ['./desk-list.component.scss'],
})
export class DeskListComponent implements OnInit {

  //deskList: Desk[] = [];

  constructor(private modalController: ModalController) { }

  ngOnInit() {}


  dismissModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
