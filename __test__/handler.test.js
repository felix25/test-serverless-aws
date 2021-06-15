const { exportData } = require('../handler');
const { expect } = require('@jest/globals');

describe('TEST REST', () => {
  describe('function exportData', () => {
    test('return array', async () => {
      const BASE_URL_DEFAULT = 'https://swapi.py4e.com/api/people/1/';
      const data =  await exportData(BASE_URL_DEFAULT);
      expect(data).toMatchObject(data);
    });
    test('url incorrecta', async () => {
      const BASE_URL_DEFAULT = 'https://swapi.py4e.com/api/peoplee/1/';
      const data = exportData(BASE_URL_DEFAULT);
      await expect(data).rejects.toEqual(Error('Request failed with status code 404'));

    })
  })
});
