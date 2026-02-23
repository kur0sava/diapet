import type { RegionStoreInfo } from '../types';

export const REGION_STORES: RegionStoreInfo[] = [
  {
    region: 'RU',
    stores: [
      { id: 'ru-4lapy', name: '4 Lapy', nameRu: 'Четыре Лапы', url: 'https://4lapy.ru', type: 'retail' },
      { id: 'ru-ozon', name: 'Ozon', url: 'https://ozon.ru', type: 'marketplace' },
      { id: 'ru-wb', name: 'Wildberries', url: 'https://wildberries.ru', type: 'marketplace' },
      { id: 'ru-zoomag', name: 'ZooMag', nameRu: 'ЗооМаг', url: 'https://zoomag.ru', type: 'online' },
      { id: 'ru-zoozavr', name: 'ZooZavr', nameRu: 'ЗооЗавр', url: 'https://zoozavr.ru', type: 'online' },
      { id: 'ru-markvet', name: 'MarkVet', nameRu: 'МаркВет', url: 'https://markvet.ru', type: 'vet_pharmacy' },
      { id: 'ru-holistic', name: 'Holistic Shop', url: 'https://holistic-shop.ru', type: 'online' },
      { id: 'ru-rcshop', name: 'Royal Canin Shop', url: 'https://royalcanin.ru', type: 'online' },
      { id: 'ru-purina', name: 'Purina Shop', url: 'https://shop.purina.ru', type: 'online' },
    ],
  },
  {
    region: 'US',
    stores: [
      { id: 'us-chewy', name: 'Chewy', url: 'https://chewy.com', type: 'online' },
      { id: 'us-petco', name: 'Petco', url: 'https://petco.com', type: 'retail' },
      { id: 'us-petsmart', name: 'PetSmart', url: 'https://petsmart.com', type: 'retail' },
      { id: 'us-amazon', name: 'Amazon', url: 'https://amazon.com', type: 'marketplace' },
      { id: 'us-proplan', name: 'Pro Plan Vet Direct', url: 'https://proplanvetdirect.com', type: 'online' },
    ],
  },
  {
    region: 'EU',
    stores: [
      { id: 'eu-zooplus', name: 'Zooplus', url: 'https://zooplus.de', type: 'online' },
      { id: 'eu-amazon', name: 'Amazon EU', url: 'https://amazon.de', type: 'marketplace' },
      { id: 'eu-farmina', name: 'Farmina Shop', url: 'https://farmina.com', type: 'online' },
    ],
  },
  {
    region: 'DE',
    stores: [
      { id: 'de-zooplus', name: 'Zooplus', url: 'https://zooplus.de', type: 'online' },
      { id: 'de-fressnapf', name: 'Fressnapf', url: 'https://fressnapf.de', type: 'retail' },
      { id: 'de-amazon', name: 'Amazon DE', url: 'https://amazon.de', type: 'marketplace' },
      { id: 'de-zooroyal', name: 'ZooRoyal', url: 'https://zooroyal.de', type: 'online' },
    ],
  },
  {
    region: 'UK',
    stores: [
      { id: 'uk-zooplus', name: 'Zooplus UK', url: 'https://zooplus.co.uk', type: 'online' },
      { id: 'uk-petsathome', name: 'Pets at Home', url: 'https://petsathome.com', type: 'retail' },
      { id: 'uk-amazon', name: 'Amazon UK', url: 'https://amazon.co.uk', type: 'marketplace' },
      { id: 'uk-viovet', name: 'VioVet', url: 'https://viovet.co.uk', type: 'online' },
    ],
  },
  {
    region: 'MX',
    stores: [
      { id: 'mx-mercadolibre', name: 'MercadoLibre', url: 'https://mercadolibre.com.mx', type: 'marketplace' },
      { id: 'mx-petco', name: 'Petco México', url: 'https://petco.com.mx', type: 'retail' },
      { id: 'mx-amazon', name: 'Amazon MX', url: 'https://amazon.com.mx', type: 'marketplace' },
      { id: 'mx-lauropet', name: 'Lauro Pet Shop', url: 'https://lauropet.com', type: 'online' },
    ],
  },
];

export function getStoresForRegion(region: string): RegionStoreInfo | undefined {
  return REGION_STORES.find(r => r.region === region);
}
