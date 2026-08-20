import { resolveCategoryIcon } from './category-icon';

describe('resolveCategoryIcon', () => {
  it('maps every real API icon name to a valid Ionicons outline name', () => {
    expect(resolveCategoryIcon('shopping-cart')).toBe('cart-outline');
    expect(resolveCategoryIcon('utensils')).toBe('restaurant-outline');
    expect(resolveCategoryIcon('car')).toBe('car-outline');
    expect(resolveCategoryIcon('home')).toBe('home-outline');
    expect(resolveCategoryIcon('file-text')).toBe('receipt-outline');
    expect(resolveCategoryIcon('gamepad')).toBe('game-controller-outline');
    expect(resolveCategoryIcon('heart')).toBe('heart-outline');
    expect(resolveCategoryIcon('more-horizontal')).toBe('pricetags-outline');
  });

  it('maps the FALLBACK_CATEGORIES icon names as well', () => {
    expect(resolveCategoryIcon('cart')).toBe('cart-outline');
    expect(resolveCategoryIcon('restaurant')).toBe('restaurant-outline');
    expect(resolveCategoryIcon('receipt')).toBe('receipt-outline');
    expect(resolveCategoryIcon('game-controller')).toBe('game-controller-outline');
    expect(resolveCategoryIcon('medkit')).toBe('medkit-outline');
    expect(resolveCategoryIcon('ellipsis-horizontal')).toBe('pricetags-outline');
  });

  it('falls back to pricetag-outline for an unknown icon name', () => {
    expect(resolveCategoryIcon('some-unknown-icon')).toBe('pricetag-outline');
  });

  it('falls back to pricetag-outline for null, undefined or empty values', () => {
    expect(resolveCategoryIcon(null)).toBe('pricetag-outline');
    expect(resolveCategoryIcon(undefined)).toBe('pricetag-outline');
    expect(resolveCategoryIcon('')).toBe('pricetag-outline');
  });
});
