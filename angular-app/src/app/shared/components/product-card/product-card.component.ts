import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Product } from '../../../domain/models/product.model';
import { CartStore } from '../../../core/state/cart.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() view = new EventEmitter<string>();

  private readonly cartStore = inject(CartStore);

  onView(): void {
    this.view.emit(this.product.id);
  }

  onAdd(): void {
    this.cartStore.addProduct(this.product, 1);
  }
}
