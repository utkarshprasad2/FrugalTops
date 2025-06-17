import { render, screen, fireEvent } from '@testing-library/react';
import { Wishlist } from '../Wishlist';

describe('Wishlist', () => {
  const mockItems = [
    { id: 1, name: 'Product 1', price: 10.99, image: 'image1.jpg' },
    { id: 2, name: 'Product 2', price: 20.99, image: 'image2.jpg' },
  ];

  const mockOnRemoveFromWishlist = jest.fn();
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no items', () => {
    render(
      <Wishlist
        items={[]}
        onRemoveFromWishlist={mockOnRemoveFromWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('No items in wishlist')).toBeInTheDocument();
    expect(screen.getByText('Start adding items to your wishlist!')).toBeInTheDocument();
  });

  it('renders wishlist items correctly', () => {
    render(
      <Wishlist
        items={mockItems}
        onRemoveFromWishlist={mockOnRemoveFromWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
    expect(screen.getByText('$20.99')).toBeInTheDocument();
  });

  it('calls onRemoveFromWishlist when remove button is clicked', () => {
    render(
      <Wishlist
        items={mockItems}
        onRemoveFromWishlist={mockOnRemoveFromWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    expect(mockOnRemoveFromWishlist).toHaveBeenCalledWith(1);
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    render(
      <Wishlist
        items={mockItems}
        onRemoveFromWishlist={mockOnRemoveFromWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addToCartButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addToCartButtons[0]);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockItems[0]);
  });
}); 