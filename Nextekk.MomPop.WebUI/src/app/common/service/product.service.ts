import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Product } from "../models/product.model";
import { Observable } from "rxjs";

@Injectable()
export class ProductService {
    private productApiURL: string = 'http://localhost:50781/api/Products';
    private checkoutApiURL: string = 'http://localhost:50781/api/transaction/checkout';

    constructor(private _http: HttpClient) {}

    getAllProducts(): Observable<Product[]> {
        return this._http.get<Product[]>(this.productApiURL);
    }

    addProduct(product: Product): Observable<number> {
        return this._http.post<number>(this.productApiURL, product);
    }

    updateProduct(product: Product) {
        return this._http.put(`${this.productApiURL}/${product.id}`, product);
    }

    deleteProduct(id: number): Observable<any> {
        console.log('called');
        return this._http.delete(this.productApiURL, { params: { id: id.toString() } });
    }

    checkout(orders: object[]) {
        return this._http.post(this.checkoutApiURL, orders);
    } 
}
