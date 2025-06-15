import axios from 'axios';
import { fetchProducts, fetchProductById } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('fetches products successfully', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

      const result = await fetchProducts();
      expect(result).toEqual(mockProducts);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/products');
    });

    it('handles errors appropriately', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(fetchProducts()).rejects.toThrow(errorMessage);
    });
  });

  describe('fetchProductById', () => {
    it('fetches a single product successfully', async () => {
      const mockProduct = { id: 1, name: 'Product 1' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProduct });

      const result = await fetchProductById(1);
      expect(result).toEqual(mockProduct);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/products/1');
    });
  });
}); 