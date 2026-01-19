import type { ComponentData, PartData, TypeData, ZeroCodeData, ImageData } from '../../types';

export const sampleComponentData: ComponentData = {
  id: 'comp-1',
  part_id: 'part-1',
  title: 'サンプルタイトル',
  subtitle: 'サブタイトル',
  content: 'コンテンツ',
  showContent: true,
  imageUrl: 'img-1',
  richText: '<p>リッチテキスト</p>',
  tags: ['tag1', 'tag2']
};

export const samplePartData: PartData = {
  id: 'part-1',
  title: 'サンプルパーツ',
  description: 'サンプルパーツの説明',
  body: '<div>{$title:デフォルトタイトル}</div>'
};

export const sampleTypeData: TypeData = {
  id: 'type-1',
  type: 'sample',
  description: 'サンプルタイプ',
  parts: [samplePartData]
};

export const sampleImageData: ImageData[] = [
  {
    id: 'img-1',
    name: 'sample.jpg',
    url: 'https://example.com/sample.jpg'
  },
  {
    id: 'img-2',
    name: 'sample2.jpg',
    url: 'https://example.com/sample2.jpg'
  }
];

export const sampleZeroCodeData: ZeroCodeData = {
  page: [sampleComponentData],
  css: {
    common: '',
    individual: '',
    special: ''
  },
  parts: {
    common: [sampleTypeData],
    individual: [],
    special: []
  },
  images: {
    common: sampleImageData,
    individual: [],
    special: []
  },
  backendData: {
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]
  }
};

export const sampleBackendData = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    profile: {
      age: 30,
      city: 'Tokyo'
    }
  },
  items: [
    { id: 1, name: 'Item 1', price: 100 },
    { id: 2, name: 'Item 2', price: 200 }
  ],
  shop_id: 'shop-123'
};
