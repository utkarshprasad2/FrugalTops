import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingCart } from '../ShoppingCart';

describe('ShoppingCart', () => {
  const mockItems = [
    { id: 1, name: 'Product 1', price: 10.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 20.99, quantity: 1 },
  ];

  const mockOnClose = jest.fn();
  const mockOnUpdateQuantity = jest.fn();
  const mockOnRemoveItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cart items correctly', () => {
    render(
      <ShoppingCart
        isOpen={true}
        onClose={mockOnClose}
        items={mockItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$42.97')).toBeInTheDocument(); // Total: (10.99 * 2) + 20.99
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ShoppingCart
        isOpen={true}
        onClose={mockOnClose}
        items={mockItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onUpdateQuantity when quantity buttons are clicked', () => {
    render(
      <ShoppingCart
        isOpen={true}
        onClose={mockOnClose}
        items={mockItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    const incrementButtons = screen.getAllByText('+');
    fireEvent.click(incrementButtons[0]);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 3);

    const decrementButtons = screen.getAllByText('-');
    fireEvent.click(decrementButtons[0]);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    render(
      <ShoppingCart
        isOpen={true}
        onClose={mockOnClose}
        items={mockItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    expect(mockOnRemoveItem).toHaveBeenCalledWith(1);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ShoppingCart
        isOpen={false}
        onClose={mockOnClose}
        items={mockItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    expect(container.firstChild).toBeNull();
  });
}); 