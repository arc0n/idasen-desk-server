import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Desk} from "../../../models/desk";



@Component({
  selector: 'modal-search-desk',
  templateUrl: './desk-list.component.html',
  styleUrls: ['./desk-list.component.scss'],
})
export class DeskListComponent implements OnInit {

  deskList: Desk[] = [
    {name: "desk 123", address: "0"},
    {name: "desk 653", address: "0"},
  ];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }


  dismissModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
