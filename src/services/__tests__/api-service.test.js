// Mock API service test
const apiService = {
  async fetchData(endpoint) {
    return { data: 'mock data' };
  }
};

describe('API Service', () => {
  test('fetchData returns mock data', async () => {
    const result = await apiService.fetchData('/test');
    expect(result).toEqual({ data: 'mock data' });
  });
});
