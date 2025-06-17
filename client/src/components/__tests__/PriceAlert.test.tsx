import { render, screen, fireEvent } from '@testing-library/react';
import { PriceAlert } from '../PriceAlert';

describe('PriceAlert', () => {
  const mockOnSetAlert = jest.fn();
  const mockOnRemoveAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bell icon button', () => {
    render(
      <PriceAlert
        currentPrice={99.99}
        onSetAlert={mockOnSetAlert}
        onRemoveAlert={mockOnRemoveAlert}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows alert form when clicked', () => {
    render(
      <PriceAlert
        currentPrice={99.99}
        onSetAlert={mockOnSetAlert}
        onRemoveAlert={mockOnRemoveAlert}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/alert me when price drops below/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('sets alert price when form is submitted', () => {
    render(
      <PriceAlert
        currentPrice={99.99}
        onSetAlert={mockOnSetAlert}
        onRemoveAlert={mockOnRemoveAlert}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '89.99' } });
    fireEvent.click(screen.getByText('Set Alert'));

    expect(mockOnSetAlert).toHaveBeenCalledWith(89.99);
  });

  it('shows remove button when alert is set', () => {
    render(
      <PriceAlert
        currentPrice={99.99}
        onSetAlert={mockOnSetAlert}
        onRemoveAlert={mockOnRemoveAlert}
        alertPrice={89.99}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onRemoveAlert when remove button is clicked', () => {
    render(
      <PriceAlert
        currentPrice={99.99}
        onSetAlert={mockOnSetAlert}
        onRemoveAlert={mockOnRemoveAlert}
        alertPrice={89.99}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Remove'));
    expect(mockOnRemoveAlert).toHaveBeenCalled();
  });
}); 