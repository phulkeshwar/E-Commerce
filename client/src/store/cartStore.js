const CART_KEY = "GaramBazaar_cart";
const SAVED_FOR_LATER_KEY = "GaramBazaar_saved_for_later";

export const getStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setStoredCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
};

export const getStoredSavedForLater = () => {
  try {
    const raw = localStorage.getItem(SAVED_FOR_LATER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setStoredSavedForLater = (items) => {
  try {
    localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(items));
  } catch {}
};
