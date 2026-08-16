// Shared price helpers. The sale price is ALWAYS derived server-side from the
// stored discountPercent — never trusted from the client.
export const salePriceFor = (product) => {
  const discountPercent = Number(product.discountPercent) || 0;
  if (discountPercent <= 0) return Number(product.price) || 0;
  return Number((product.price * (1 - discountPercent / 100)).toFixed(2));
};

export const productDiscountFor = (product) => {
  return Number((product.price - salePriceFor(product)).toFixed(2));
};