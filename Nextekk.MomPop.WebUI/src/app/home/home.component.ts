import { Component, OnInit, ViewChild } from "@angular/core";
import { ProductService } from "../common/service/product.service";
import { Product } from "../common/models/product.model";
import { CartComponent } from "../cart/cart.component";
import { Cart } from "../common/models/cart.model";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    show: boolean;
    products: Product[];
    
    get totalItemsInCart(): number {
        return this.cartComponent && this.cartComponent.totalItems;
    }

    private _products: Product[];

    @ViewChild(CartComponent)
    private cartComponent: CartComponent;

    constructor(private _productService: ProductService) {
        this.products = [];
        this._products = [];
        this.show = false;
    }

    ngOnInit(): void {
        this._productService.getAllProducts().subscribe(data => {
            this.products = this._products = data;

            /* Long way
            this._products = data;
            this.products = this._products;
            */
        });
    }

    searchProduct($event) {
        const value = $event.currentTarget.value.toLowerCase();

        this.products = this._products.filter((product: Product) => product.name.toLowerCase().includes(value));

        /* ES 5 function
        this.products.filter(function (product: Product) {
            return product.name == value;
        });
        */
    }

    addToCart(product: Product) {
        this.cartComponent.addItemToCarts(product);
    }

    toggleCartView() {
        // this.show = !this.show;
        this.cartComponent.showCart();
    }

    checkOutSuccessful($event: any[]) {
        this._products.forEach(product => {
            const itemInCart = $event.find(x => x.productId == product.id);

            if (itemInCart) {
                product.stock -= itemInCart.quantity;
            }
        });
    }
}
