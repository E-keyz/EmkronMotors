import { BUSINESS_SELLER } from './listings';

/** Turns 0803... or +234803... into the digits-only international form WhatsApp expects. */
function toInternational(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '234' + digits.slice(1);
  return digits;
}

const SELL_MESSAGE =
  'Hello Emkron Motors, I would like to sell my car. Here are the details:\n\nMake & model:\nYear:\nMileage:\nLocation:\nAsking price:';

/** "Sell My Car" in the header opens a WhatsApp chat with the business owner. */
export function sellCarWhatsAppLink(): string {
  const phone = toInternational(BUSINESS_SELLER.whatsapp);
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(SELL_MESSAGE)}`;
}
