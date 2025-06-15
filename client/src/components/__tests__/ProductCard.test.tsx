import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    image: 'test-image.jpg',
    description: 'Test description'
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.jpg');
  });

  it('handles missing image gracefully', () => {
    const productWithoutImage = { ...mockProduct, image: '' };
    render(<ProductCard product={productWithoutImage} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('src', 'placeholder.jpg');
  });
}); 