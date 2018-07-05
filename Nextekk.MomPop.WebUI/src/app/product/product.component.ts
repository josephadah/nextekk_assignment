import { Component, OnInit, ViewChild, OnChanges } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Product } from "../common/models/product.model";
import { ProductService } from "../common/service/product.service";
import {HubConnection, HubConnectionBuilder} from "@aspnet/signalr";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
    products: Product[];
    editingProductId = 0;
    alert = {
        type: "success", 
        message: '', 
        timeout: 5000
    }

    public stockConnection: HubConnection;

    private _products: Product[];

    @ViewChild('form')
    private form: NgForm;

    @ViewChild('editform')
    private editform: NgForm;

    get canSave(): boolean {
        return this.form.valid;
    }

    constructor(private productService: ProductService) {
        this.products = [];
        this._products = [];
    }

    ngOnInit() {
        this.refreshProducts();

        this.stockConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:50781/stockhub")
            .build();

        this.stockConnection.on('stockChanged', () => {
            this.refreshProducts();
        });

        this.stockConnection.start().
            then(() => {
                console.log('connected');
            }).
            catch(err => console.error(err.toString()));
    }

    refreshProducts() {
        this.productService.getAllProducts().subscribe(data => {
            this.products = this._products = data;
        });
    }

    searchProduct($event) {
        const value = $event.currentTarget.value.toLowerCase();

        this.products = this._products.filter(
            (product: Product) => 
                    product.name.toLowerCase().includes(value) || 
                    product.price.toString().includes(value)
        );
    }

    echo() {
        this.stockConnection.invoke("UpdateStock");
    }

    addProduct(form: NgForm) {
        if (this.form.dirty && this.form.valid) {
            const value = form.value;
            let newProduct: Product = new Product();
            newProduct.name = value.name;
            newProduct.price = value.price;
            newProduct.stock = value.stock;
            newProduct.description = value.description;

            this.productService.addProduct(newProduct).subscribe(data => {
                newProduct.id = data;
                this._products.push(newProduct);
                this.products = this._products;
                this.echo();

                this.alert.message = `${newProduct.name} was Added Successfully.`;
                setTimeout(
                    () => {
                        this.alert.message = '';
                    }, 
                    this.alert.timeout);
            });

            form.reset();
        }

    }

    isEditing(id) {
        if (id == this.editingProductId) {
            return true;
        } else {
            return false;
        }
    }
    

    editProduct(editform: NgForm, product: Product) {
        // this.productService.updateProduct(product).subscribe();

        if (this.editform.dirty && this.editform.valid) {
            const value = editform.value;

            product.name = value.name;
            product.price = value.price;
            product.stock = value.stock;
            product.description = value.description;
            
            this.productService.updateProduct(product).subscribe(data => {
                // this.editedProduct.id = data;
                // this._products.push(this.editedProduct);
                // this.products = this._products;

                this.echo();
                
                this.alert.message = `${product.name} was Edited Successfully.`;
                setTimeout(
                    () => {
                        this.alert.message = '';
                    }, 
                    this.alert.timeout);
            });

            this.editingProductId = 0;
        }
    }

    deleteProduct(id: number, product: Product) {
        let productName = product.name;
        this.productService.deleteProduct(id).subscribe(data => {
            let index = this.products.indexOf(product);
            if(index > -1) {
                this._products.splice(index, 1);
            }
            this.products = this._products;

            this.echo();

            // alert(`${productName} was deleted successfully`);
            this.alert.type = "danger";
            this.alert.message = `${productName} was Deleted Successfully.`;
            setTimeout(
                () => {
                    this.alert.message = '';
                    this.alert.type = "success";
                }, 
                this.alert.timeout);
        });
    }
}
