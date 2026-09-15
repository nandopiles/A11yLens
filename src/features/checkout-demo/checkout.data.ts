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
  { id: 'card', label: 'Card number', placeholder: 'Card number', autoComplete: 'cc-number', maxLength: 19 },
  { id: 'exp', label: 'Expiry', placeholder: 'MM / YY', autoComplete: 'cc-exp', maxLength: 7 },
  { id: 'cvc', label: 'CVC', placeholder: 'CVC', autoComplete: 'cc-csc', maxLength: 4 },
  { id: 'name', label: 'Name on card', placeholder: 'Name on card', autoComplete: 'cc-name' },
];

export const orderLines: OrderLine[] = [
  { label: 'Subtotal (2 items)', value: '$129.00' },
  { label: 'Express shipping', value: 'Free' },
];

export const orderTotal: OrderLine = { label: 'Total', value: '$129.00 USD' };

export const storeName = 'Lumina Store';
