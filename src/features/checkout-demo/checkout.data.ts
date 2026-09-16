/** Repository: mock content for the checkout demo. Render logic holds no hard-coded copy. */

export interface CheckoutField {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  maxLength?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: string;
  /** Emoji stand-in for a product photo (keeps the demo asset-free but vivid). */
  emoji: string;
  /** Brand color for the product thumbnail background. */
  swatch: string;
}

export interface OrderLine {
  label: string;
  value: string;
}

export const checkoutFields: CheckoutField[] = [
  { id: 'card', label: 'Número de tarjeta', placeholder: 'Número de tarjeta', autoComplete: 'cc-number', maxLength: 19 },
  { id: 'exp', label: 'Caducidad', placeholder: 'MM / AA', autoComplete: 'cc-exp', maxLength: 7 },
  { id: 'cvc', label: 'CVC', placeholder: 'CVC', autoComplete: 'cc-csc', maxLength: 4 },
  { id: 'name', label: 'Nombre en la tarjeta', placeholder: 'Nombre en la tarjeta', autoComplete: 'cc-name' },
];

export const orderItems: OrderItem[] = [
  { id: 'i1', name: 'Auriculares Lumina One', variant: 'Grafito · ANC', price: '99,00 €', emoji: '🎧', swatch: '#e0e7ff' },
  { id: 'i2', name: 'Funda de viaje', variant: 'Talla única', price: '30,00 €', emoji: '🧳', swatch: '#fce7f3' },
];

export const orderLines: OrderLine[] = [
  { label: 'Subtotal (2 artículos)', value: '129,00 €' },
  { label: 'Envío exprés', value: 'Gratis' },
];

export const orderTotal: OrderLine = { label: 'Total', value: '129,00 € EUR' };

export const storeName = 'Lumina Store';
