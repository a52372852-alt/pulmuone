// 19가지 의무 표시 알레르기 유발 물질 목록 (한국 학교급식 기준)
const ALLERGENS = [
  '난류', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우', 
  '돼지고기', '복숭아', '토마토', '아황산류', '호두', '닭고기', '쇠고기', 
  '오징어', '조개류', '잣'
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: '바른선 국산콩 대용량 판두부',
    brand: '풀무원 바른선',
    category: 'tofu-vegetables',
    spec: '3kg (1입)',
    price: 15500,
    allergens: ['대두'],
    badges: ['organic', 'popular'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '80 kcal',
      carbs: '2g',
      protein: '8g',
      fat: '4.5g'
    },
    description: '100% 국산콩으로 만들어 고소하고 든든한 단체급식용 판두부입니다. 학교 급식의 다양한 찌개 및 조림 요리에 안심하고 사용할 수 있습니다.'
  },
  {
    id: 2,
    name: '지구식단 식물성 바삭 텐더',
    brand: '풀무원 지구식단',
    category: 'earth-diet',
    spec: '1.2kg (봉)',
    price: 18900,
    originalPrice: 22000,
    allergens: ['대두', '밀'],
    badges: ['earth', 'popular', 'sale'],
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '210 kcal',
      carbs: '18g',
      protein: '13g',
      fat: '9g'
    },
    description: '결이 살아있는 식물성 단백질로 만들어 겉은 바삭하고 속은 촉촉한 텐더입니다. 육류를 전혀 사용하지 않아 환경을 생각하는 급식 메뉴로 안성맞춤입니다.'
  },
  {
    id: 3,
    name: '바른선 얇은피 꽉찬속 고기만두 (급식용)',
    brand: '풀무원 바른선',
    category: 'processed',
    spec: '1.5kg (봉)',
    price: 14200,
    originalPrice: 17500,
    allergens: ['돼지고기', '밀', '대두'],
    badges: ['popular', 'sale'],
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '185 kcal',
      carbs: '22g',
      protein: '8g',
      fat: '7g'
    },
    description: '0.7mm 얇은피 공법을 적용하여 밀가루 맛은 줄이고, 국산 돼지고기와 신선한 야채로 가득 채운 프리미엄 급식 만두입니다.'
  },
  {
    id: 4,
    name: '아임리얼 생과일 딸기 주스 (급식 미니)',
    brand: '아임리얼',
    category: 'snacks',
    spec: '120ml (40개입/BOX)',
    price: 48000,
    allergens: [],
    badges: ['popular', 'new'],
    rating: 4.8,
    reviewCount: 307,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1병(120ml)당',
      calories: '65 kcal',
      carbs: '15g',
      protein: '1g 미만',
      fat: '0g'
    },
    description: '물 한 방울 넣지 않고 100% 딸기와 배즙만으로 만든 프리미엄 생과일 주스입니다. 학교 급식 디저트에 적합한 미니 용량 패키지입니다.'
  },
  {
    id: 5,
    name: '바른선 유기농 아삭 콩나물',
    brand: '풀무원 바른선',
    category: 'tofu-vegetables',
    spec: '2kg (1입)',
    price: 8800,
    allergens: ['대두'],
    badges: ['organic'],
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '30 kcal',
      carbs: '3g',
      protein: '3.5g',
      fat: '1.2g'
    },
    description: '농약과 화학비료 없이 깨끗한 지하수로 키운 유기농 콩나물입니다. 숨 쉬는 포장 기술로 아삭한 식감이 오랫동안 유지됩니다.'
  },
  {
    id: 6,
    name: '바른선 국산 순살 삼치구이 (오븐용)',
    brand: '풀무원 바른선',
    category: 'processed',
    spec: '1.2kg (40g*30쪽)',
    price: 36000,
    originalPrice: 42000,
    allergens: ['고등어'],
    badges: ['sale'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1쪽(40g)당',
      calories: '95 kcal',
      carbs: '0.5g',
      protein: '9g',
      fat: '6g'
    },
    description: '가시를 99% 이상 제거하여 어린 학생들이 안심하고 먹을 수 있는 순살 삼치구이입니다. 오븐에 바로 구워 배식하기 편리하게 개별 급속 냉동(IQF)되었습니다.'
  },
  {
    id: 7,
    name: '지구식단 식물성 직화 런천미트',
    brand: '풀무원 지구식단',
    category: 'earth-diet',
    spec: '1kg (캔형 대용량)',
    price: 16500,
    allergens: ['대두', '밀'],
    badges: ['earth'],
    image: 'https://images.unsplash.com/photo-152443841834f-12d83df4a2f4?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '240 kcal',
      carbs: '6g',
      protein: '14g',
      fat: '18g'
    },
    description: '풀무원의 독자적인 식물성 단백질 가공 기술로 햄 본연의 쫄깃한 식감과 짭조름한 직화 향을 완벽하게 재현한 캔햄 대용량 버전입니다.'
  },
  {
    id: 8,
    name: '자연은 맛있다 꽃게탕면 (급식용 번들)',
    brand: '풀무원 자연은 맛있다',
    category: 'processed',
    spec: '32입 (BOX)',
    price: 38400,
    allergens: ['밀', '대두', '게', '새우', '조개류'],
    badges: [],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1봉(103g)당',
      calories: '365 kcal',
      carbs: '68g',
      protein: '9g',
      fat: '6g'
    },
    description: '기름에 튀기지 않고 바람으로 말려 쫄깃하고 가벼운 생면 식감의 라면입니다. 꽃게로 우려내어 시원하고 얼큰한 국물 맛이 특징입니다.'
  },
  {
    id: 9,
    name: '바른선 락토프리 유기농 요구르트',
    brand: '풀무원 바른선',
    category: 'snacks',
    spec: '80ml (60개입/BOX)',
    price: 24000,
    allergens: ['우유'],
    badges: ['organic'],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1병(80ml)당',
      calories: '55 kcal',
      carbs: '11g',
      protein: '1.5g',
      fat: '0.8g'
    },
    description: '유제품 소화가 어려운 아이들을 위해 유당을 분해한 유기농 락토프리 요구르트입니다. 풍부한 프로바이오틱스가 소화를 돕습니다.'
  },
  {
    id: 10,
    name: '바른선 유기농 곡물 뮤즐리 바',
    brand: '풀무원 바른선',
    category: 'snacks',
    spec: '25g (100개입/BOX)',
    price: 49000,
    allergens: ['우유', '땅콩', '밀'],
    badges: ['organic', 'popular'],
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1바(25g)당',
      calories: '98 kcal',
      carbs: '17g',
      protein: '2g',
      fat: '2.5g'
    },
    description: '국산 유기농 통곡물에 견과류와 크랜베리를 더해 꿀로 뭉친 건강한 영양 간식 바입니다. 간편한 아침 급식 대용이나 방과 후 간식으로 매우 인기가 높습니다.'
  },
  {
    id: 11,
    name: '바른선 훈제 안심 구운달걀',
    brand: '풀무원 바른선',
    category: 'processed',
    spec: '60알 (판)',
    price: 19800,
    allergens: ['난류'],
    badges: ['new'],
    rating: 4.9,
    reviewCount: 96,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '1알(45g)당',
      calories: '70 kcal',
      carbs: '0.5g',
      protein: '6.2g',
      fat: '4.8g'
    },
    description: 'haccp 인증을 받은 청정 농장에서 건강하게 생산된 달걀을 참나무 연기로 훈제하여 쫄깃하고 담백한 영양 달걀입니다.'
  },
  {
    id: 12,
    name: '지구식단 식물성 직화 불고기 (달콤간장)',
    brand: '풀무원 지구식단',
    category: 'earth-diet',
    spec: '1.5kg (봉)',
    price: 24500,
    originalPrice: 29000,
    allergens: ['대두', '밀'],
    badges: ['earth', 'new', 'sale'],
    rating: 4.7,
    reviewCount: 412,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    nutrition: {
      servingSize: '100g당',
      calories: '190 kcal',
      carbs: '12g',
      protein: '15g',
      fat: '8g'
    },
    description: '대두 단백질로 고기 결을 그대로 구현해 불고기의 쫄깃한 씹는 맛을 살렸습니다. 숯불에 구운 풍미 가득한 맛으로 아이들의 선호도가 대단히 높은 식물성 대체육 메뉴입니다.'
  }
];

// 급식 추천 식단표 데이터
const MENU_RECOMMENDATIONS = [
  {
    id: 'menu-1',
    title: '지구식단 기후행동 급식의 날',
    desc: '탄소 배출을 줄이고 자라나는 아이들의 건강을 보살피는 친환경 식물성 맞춤 급식 식단',
    target: '초·중·고 공통',
    productIds: [2, 12, 1, 4], // 식물성 텐더, 식물성 직화불고기, 판두부, 아임리얼 딸기
    tag: '기후급식'
  },
  {
    id: 'menu-2',
    title: '바른선 튼튼 뼈건강 한식 급식',
    desc: '성장기 어린이의 칼슘 보충과 영양 균형을 위한 엄선된 한식 급식 라인업',
    target: '초등학교 추천',
    productIds: [6, 5, 3, 9], // 삼치구이, 유기농 콩나물, 얇은피 고기만두, 락토프리 요구르트
    tag: '칼슘강화'
  },
  {
    id: 'menu-3',
    title: '수요 특식! 단백질 파워 에너지 식단',
    desc: '체육활동이 많은 날, 풍부한 단백질과 에너지 공급을 위한 간편하지만 맛깔나는 구성',
    target: '중·고등학교 추천',
    productIds: [11, 8, 10, 4], // 훈제구운달걀, 꽃게탕면, 뮤즐리 바, 아임리얼 딸기
    tag: '고단백'
  }
];

// 로컬스토리지 저장 키
const DATA_STORAGE_KEY = 'pulmuone_b2b_products';

// 로컬스토리지 상품 목록 로드
function getProducts() {
  const localData = localStorage.getItem(DATA_STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      // 신규 스키마(rating 속성) 존재 여부 검사하여 구버전일 경우 갱신
      const hasRatingSchema = parsed.some(p => p.rating !== undefined);
      if (hasRatingSchema) {
        return parsed;
      }
    } catch (e) {
      console.error('로컬스토리지 파싱 실패. 기본 데이터 복원.', e);
    }
  }
  // 데이터가 없거나, 구버전이거나, 에러 시 기본 리스트 저장 후 반환
  localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

// 로컬스토리지 상품 목록 저장
function saveProducts(productsList) {
  localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(productsList));
  // 전역 변수 동기화
  PRODUCTS = productsList;
}

// 각 스크립트에서 참조할 전역 변수 실시간 바인딩
let PRODUCTS = getProducts();

