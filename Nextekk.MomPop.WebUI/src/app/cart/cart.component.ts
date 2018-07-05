import { Cart } from "../common/models/cart.model";
import { Component, Input, ViewChild, EventEmitter, Output, OnInit } from "@angular/core";
import { Product } from "../common/models/product.model";
import { BsModalService, BsModalRef } from "ngx-bootstrap";
import { ProductService } from "../common/service/product.service";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html', 
})
export class CartComponent implements OnInit {
    carts: Cart[];

    @Output()
    onCheckOutSuccessful: EventEmitter<object[]>;

    @Input()
    show: boolean;

    @ViewChild('cart')
    template: any;

    get totalItems(): number {
        return this.carts.reduce((prev, curr) => prev = curr.quantity + prev, 0);
    }
    modalRef: BsModalRef;
    config = {
      backdrop: true,
      ignoreBackdropClick: true
    };
    
    constructor(private modalService: BsModalService, private productService: ProductService) {
        this.carts = [];
        this.show = false;
        this.onCheckOutSuccessful = new EventEmitter<object[]>();
    }

    ngOnInit(): void { } 

    addItemToCarts(product: Product) {
        let cartInList = this.carts.find(x => x.id == product.id);

        if(cartInList) {
            cartInList.quantity += 1;
        }
        else{
            cartInList = new Cart(product.id, product.name, product.price, 1);
            this.carts.push(cartInList);
        }
        

        // const count = this.carts.reduce( (total, cart: Cart) => cart.id == product.id ? total + 1 : total, 0);

        // const cart = new Cart(product.id, product.name, product.price, count);

        // this.carts.push(cart);
    }

    showCart() {
        this.modalRef = this.modalService.show(this.template, this.config);
    }
    
    checkout() {
        const itemsToCheckoutDTO = this.carts.map(item => item.toDTO());

        this.productService.checkout(itemsToCheckoutDTO).subscribe(data => {
            this.carts = [];
            this.onCheckOutSuccessful.emit(itemsToCheckoutDTO);
            this.modalRef.hide();
        });

    }

    remove(id: number) {
        this.carts = this.carts.filter(x => x.id != id);
    }
} 
