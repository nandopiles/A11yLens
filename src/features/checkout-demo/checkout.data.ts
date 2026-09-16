/** Repository: mock content for the checkout demo. Render logic holds no hard-coded copy. */

export interface CheckoutField {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  maxLength?: number;
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

export const orderLines: OrderLine[] = [
  { label: 'Subtotal (2 artículos)', value: '129,00 €' },
  { label: 'Envío exprés', value: 'Gratis' },
];

export const orderTotal: OrderLine = { label: 'Total', value: '129,00 € EUR' };

export const storeName = 'Lumina Store';
