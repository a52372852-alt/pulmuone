// 카탈로그 필터링 및 상세 모달 제어
let activeCategory = 'all';
let searchQuery = '';
let excludedAllergens = [];
let activeSort = 'popular';

// 서브페이지 전용 상태 변수
let currentSubpageMode = ''; // '' | 'best' | 'sale' | 'new'
let activeDiscountFilter = 'all'; // 'all' | '40-up' | '40-20' | '20-10' | '10-under'
let activeSubCategory = 'all'; // QUICK_CATEGORIES id 매핑

// 지속가능먹거리 전용 사이드바 상태 변수
let activeEarthSubCategory = 'all'; // 'all' | 'plant' | 'animal' | 'health' | 'eco'
let selectedBenefits = []; // 'shipping', 'group' 등
let selectedBrands = []; // 브랜드명 목록

const QUICK_CATEGORIES = [
  { id: 'all', name: '전체', icon: 'fa-bars', categoryKey: 'all' },
  { id: 'earth-diet', name: '지속가능먹거리', icon: 'fa-earth-asia', categoryKey: 'earth-diet' },
  { id: 'tofu-vegetables', name: '두부·콩나물·달걀', icon: 'fa-egg', categoryKey: 'tofu-vegetables' },
  { id: 'vegetables', name: '과일·채소·쌀', icon: 'fa-wheat-awn', categoryKey: 'vegetables' },
  { id: 'processed', name: '정육·수산·가공', icon: 'fa-fish', categoryKey: 'processed' },
  { id: 'dumpling-noodle', name: '만두·피자·면요리', icon: 'fa-pizza-slice', categoryKey: 'dumpling-noodle' },
  { id: 'soup-side', name: '국·탕·반찬·양념', icon: 'fa-bowl-food', categoryKey: 'soup-side' },
  { id: 'snacks', name: '과자·간식·음료', icon: 'fa-cookie', categoryKey: 'snacks' },
  { id: 'health', name: '건강식품·녹즙', icon: 'fa-capsules', categoryKey: 'health' }
];


document.addEventListener('DOMContentLoaded', () => {
  initCatalog();
  bindCatalogEvents();
  parseQueryParams();
  filterAndRenderProducts();
});

// 카탈로그 초기화 (알레르기 체크박스 생성 등)
function initCatalog() {
  const container = document.getElementById('allergyFilterContainer');
  if (!container) return;

  let html = '';
  ALLERGENS.forEach(allergen => {
    html += `
      <label class="allergy-checkbox-label">
        <input type="checkbox" value="${allergen}" class="allergy-checkbox">
        <span>${allergen}</span>
      </label>
    `;
  });
  container.innerHTML = html;
}

// 이벤트 바인딩
function bindCatalogEvents() {
  // 카테고리 탭 클릭
  const tabs = document.querySelectorAll('.category-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-category');
      
      // 상세 사이드바 필터 초기화
      activeEarthSubCategory = 'all';
      selectedBenefits = [];
      selectedBrands = [];
      
      renderSidebarFilters();
      filterAndRenderProducts();
    });
  });

  // 검색어 입력 (입력할 때마다 실시간 검색)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      
      // 검색어가 존재하면 카테고리 필터를 '전체보기'로 자동 전환
      if (searchQuery.length > 0) {
        activeCategory = 'all';
        activeEarthSubCategory = 'all';
        selectedBenefits = [];
        selectedBrands = [];
        
        const categoryTabs = document.querySelectorAll('.category-tab-btn');
        categoryTabs.forEach(t => {
          if (t.getAttribute('data-category') === 'all') {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
        
        renderSidebarFilters();
      }
      
      filterAndRenderProducts();
    });
  }

  // 알레르기 체크박스 변경
  const allergyContainer = document.getElementById('allergyFilterContainer');
  if (allergyContainer) {
    allergyContainer.addEventListener('change', () => {
      const checkedBoxes = document.querySelectorAll('.allergy-checkbox:checked');
      excludedAllergens = Array.from(checkedBoxes).map(box => box.value);
      filterAndRenderProducts();
    });
  }

  // 정렬 옵션 변경
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRenderProducts();
    });
  }

    // 모달 닫기
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeProductModal);
    }
    const modalOverlay = document.getElementById('productDetailModal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeProductModal();
        }
      });
    }
}

// 하트 찜 토글 함수
function toggleWishlist(btn) {
  const icon = btn.querySelector('i');
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    icon.classList.remove('far');
    icon.classList.add('fas');
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
  }
}

// URL 쿼리 파라미터 파싱 및 복합 연동
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  
  // 카테고리 및 배지 통합 필터 파라미터 처리
  const filterParam = params.get('filter');
  
  const titleElem = document.getElementById('catalogTitle');
  const subtitleElem = document.getElementById('catalogSubtitle');
  const normalTabs = document.getElementById('categoryTabs');

  if (filterParam && ['best', 'sale', 'new'].includes(filterParam)) {
    currentSubpageMode = filterParam;
    activeCategory = 'all'; // 일반 카탈로그용 카테고리는 초기화
    
    // 일반 카테고리 탭은 가림
    if (normalTabs) normalTabs.style.display = 'none';

    // 타이틀 갱신
    if (titleElem && subtitleElem) {
      if (filterParam === 'best') {
        subtitleElem.textContent = 'Best Product';
        titleElem.textContent = '풀무원 급식 베스트 인기 상품';
      } else if (filterParam === 'sale') {
        subtitleElem.textContent = 'Hot Sale';
        titleElem.textContent = '실시간 예상 납품단가 특가 세일';
      } else if (filterParam === 'new') {
        subtitleElem.textContent = 'New Product';
        titleElem.textContent = '신선함을 더한 신규 급식 식자재';
      }
    }

    // 동적 서브헤더 렌더링
    renderSubpageHeader();

  } else {
    // 일반 카탈로그 모드
    currentSubpageMode = '';
    activeSubCategory = 'all';
    activeDiscountFilter = 'all';
    
    if (normalTabs) normalTabs.style.display = 'flex';
    if (titleElem && subtitleElem) {
      subtitleElem.textContent = 'Catalog';
      titleElem.textContent = '풀무원 바른 식자재 카탈로그';
    }

    if (filterParam) {
      if (filterParam.startsWith('category_')) {
        const catVal = filterParam.replace('category_', '');
        activeCategory = catVal;
        
        const tab = document.querySelector(`.category-tab-btn[data-category="${catVal}"]`);
        if (tab) {
          document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      } else {
        activeCategory = filterParam;
        const tab = document.querySelector(`.category-tab-btn[data-category="${filterParam}"]`);
        if (tab) {
          document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      }
    }
  }

  // 사이드바 동적 필터 로드
  renderSidebarFilters();

  // 특정 상품 상세 파라미터 처리
  const idParam = params.get('id');
  if (idParam) {
    const productId = parseInt(idParam);
    setTimeout(() => {
      openProductModal(productId);
    }, 300);
  }
}

// 지속가능먹거리 전용 사이드바 상세 필터 렌더링 함수
function renderSidebarFilters() {
  const container = document.getElementById('dynamicSidebarFilters');
  if (!container) return;

  // 일반 카탈로그에서 'earth-diet' (지속가능먹거리) 카테고리일 때만 활성화
  if (activeCategory !== 'earth-diet') {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  let html = `
    <!-- 1. 세부 카테고리 타이틀 및 리스트 -->
    <h4 class="sidebar-filter-title">카테고리</h4>
    <div class="sidebar-category-list">
      <a class="sidebar-category-link ${activeEarthSubCategory === 'all' ? 'active' : ''}" data-earth-sub="all">전체보기</a>
      <a class="sidebar-category-link ${activeEarthSubCategory === 'plant' ? 'active' : ''}" data-earth-sub="plant">식물성지향</a>
      <a class="sidebar-category-link ${activeEarthSubCategory === 'animal' ? 'active' : ''}" data-earth-sub="animal">동물복지</a>
      <a class="sidebar-category-link ${activeEarthSubCategory === 'health' ? 'active' : ''}" data-earth-sub="health">건강한경험</a>
      <a class="sidebar-category-link ${activeEarthSubCategory === 'eco' ? 'active' : ''}" data-earth-sub="eco">친환경케어</a>
    </div>

    <!-- 2. 혜택 필터 아코디언 -->
    <div class="filter-accordion-group">
      <div class="filter-accordion-header active" data-accordion="benefit">
        <span>혜택</span>
        <i class="fas fa-chevron-up"></i>
      </div>
      <div class="filter-accordion-content" id="accordionBenefit">
        <label class="filter-checkbox-item">
          <input type="checkbox" value="group" ${selectedBenefits.includes('group') ? 'checked' : ''}>
          <span>골라담아 할인</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="shipping" ${selectedBenefits.includes('shipping') ? 'checked' : ''}>
          <span>무료배송</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="discount" ${selectedBenefits.includes('discount') ? 'checked' : ''}>
          <span>할인</span>
        </label>
      </div>
    </div>

    <!-- 3. 브랜드 필터 아코디언 -->
    <div class="filter-accordion-group" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
      <div class="filter-accordion-header active" data-accordion="brand">
        <span>브랜드</span>
        <i class="fas fa-chevron-up"></i>
      </div>
      <div class="filter-accordion-content" id="accordionBrand">
        <label class="filter-checkbox-item">
          <input type="checkbox" value="올가" ${selectedBrands.includes('올가') ? 'checked' : ''}>
          <span>올가</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="풀무원식품" ${selectedBrands.includes('풀무원식품') ? 'checked' : ''}>
          <span>풀무원식품</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="풀스키즈" ${selectedBrands.includes('풀스키즈') ? 'checked' : ''}>
          <span>풀스키즈</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="디자인밀" ${selectedBrands.includes('디자인밀') ? 'checked' : ''}>
          <span>디자인밀</span>
        </label>
        <label class="filter-checkbox-item">
          <input type="checkbox" value="풀무원 자연은 맛있다" ${selectedBrands.includes('풀무원 자연은 맛있다') ? 'checked' : ''}>
          <span>풀무원 자연 건면</span>
        </label>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // 이벤트 바인딩
  // 1) 세부 카테고리 클릭
  const catLinks = container.querySelectorAll('.sidebar-category-link');
  catLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activeEarthSubCategory = e.target.getAttribute('data-earth-sub');
      renderSidebarFilters();
      filterAndRenderProducts();
    });
  });

  // 2) 혜택 체크박스 변경
  const benefitChecks = container.querySelectorAll('#accordionBenefit input');
  benefitChecks.forEach(check => {
    check.addEventListener('change', () => {
      const checked = container.querySelectorAll('#accordionBenefit input:checked');
      selectedBenefits = Array.from(checked).map(c => c.value);
      filterAndRenderProducts();
    });
  });

  // 3) 브랜드 체크박스 변경
  const brandChecks = container.querySelectorAll('#accordionBrand input');
  brandChecks.forEach(check => {
    check.addEventListener('change', () => {
      const checked = container.querySelectorAll('#accordionBrand input:checked');
      selectedBrands = Array.from(checked).map(c => c.value);
      filterAndRenderProducts();
    });
  });

  // 4) 아코디언 토글
  const accordionHeaders = container.querySelectorAll('.filter-accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      const headerElem = e.currentTarget;
      const targetId = headerElem.getAttribute('data-accordion');
      const targetContent = container.querySelector(targetId === 'benefit' ? '#accordionBenefit' : '#accordionBrand');
      const icon = headerElem.querySelector('i');

      headerElem.classList.toggle('active');
      if (targetContent) {
        targetContent.classList.toggle('collapsed');
      }

      if (headerElem.classList.contains('active')) {
        icon.className = 'fas fa-chevron-up';
      } else {
        icon.className = 'fas fa-chevron-down';
      }
    });
  });
}

// 서브페이지 전용 헤더 및 카테고리 퀵 선택 패널 드로잉
function renderSubpageHeader() {
  const container = document.getElementById('dynamicSubpageHeader');
  if (!container) return;

  if (!currentSubpageMode) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // 1. 지금세일 모드일 때: 할인율 필터 바 노출
  if (currentSubpageMode === 'sale') {
    html += `
      <div class="discount-filter-tabs">
        <button class="discount-filter-btn ${activeDiscountFilter === 'all' ? 'active' : ''}" data-discount="all">전체</button>
        <button class="discount-filter-btn ${activeDiscountFilter === '40-up' ? 'active' : ''}" data-discount="40-up">40% 이상</button>
        <button class="discount-filter-btn ${activeDiscountFilter === '40-20' ? 'active' : ''}" data-discount="40-20">40% ~ 20%</button>
        <button class="discount-filter-btn ${activeDiscountFilter === '20-10' ? 'active' : ''}" data-discount="20-10">20% ~ 10%</button>
        <button class="discount-filter-btn ${activeDiscountFilter === '10-under' ? 'active' : ''}" data-discount="10-under">10% 미만</button>
      </div>
    `;
  }

  // 2. 베스트 또는 지금세일 모드일 때: 카테고리 퀵그리드 노출
  if (currentSubpageMode === 'best' || currentSubpageMode === 'sale') {
    html += `<div class="quick-category-grid">`;
    QUICK_CATEGORIES.forEach(cat => {
      const isActive = activeSubCategory === cat.id;
      html += `
        <button class="quick-category-btn ${isActive ? 'active' : ''}" data-cat-id="${cat.id}" data-key="${cat.categoryKey}">
          <i class="fas ${cat.icon}"></i>
          <span>${cat.name}</span>
          ${isActive ? '<div class="active-dot"></div>' : ''}
        </button>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;

  // 이벤트 바인딩
  // 1. 할인율 필터 이벤트
  if (currentSubpageMode === 'sale') {
    const discountBtns = container.querySelectorAll('.discount-filter-btn');
    discountBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        discountBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeDiscountFilter = e.target.getAttribute('data-discount');
        filterAndRenderProducts();
      });
    });
  }

  // 2. 카테고리 퀵그리드 이벤트
  if (currentSubpageMode === 'best' || currentSubpageMode === 'sale') {
    const catBtns = container.querySelectorAll('.quick-category-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnElem = e.currentTarget;
        const catId = btnElem.getAttribute('data-cat-id');

        catBtns.forEach(b => b.classList.remove('active'));
        btnElem.classList.add('active');
        activeSubCategory = catId;
        filterAndRenderProducts();
        renderSubpageHeader();
      });
    });

  }
}

// 상품 필터링 및 렌더링 핵심 로직
function filterAndRenderProducts() {
  const grid = document.getElementById('productCatalogGrid');
  const countLabel = document.getElementById('productCount');
  if (!grid) return;

  // 1. 필터링 처리
  let filtered = PRODUCTS.filter(product => {
    // 1-1. 서브페이지 및 일반 카탈로그 모드 필터 분기
    if (currentSubpageMode) {
      // (1) 서브페이지 배지 필터링
      if (currentSubpageMode === 'best') {
        if (!product.badges.includes('popular')) return false;
      } else if (currentSubpageMode === 'sale') {
        if (!product.badges.includes('sale')) return false;
        
        // 지금세일 전용 할인 범위 필터 적용
        if (activeDiscountFilter !== 'all' && product.originalPrice) {
          const discountRate = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          if (activeDiscountFilter === '40-up') {
            if (discountRate < 40) return false;
          } else if (activeDiscountFilter === '40-20') {
            if (discountRate >= 40 || discountRate < 20) return false;
          } else if (activeDiscountFilter === '20-10') {
            if (discountRate >= 20 || discountRate < 10) return false;
          } else if (activeDiscountFilter === '10-under') {
            if (discountRate >= 10) return false;
          }
        }
      } else if (currentSubpageMode === 'new') {
        if (!product.badges.includes('new')) return false;
      }

      // (2) 퀵그리드 카테고리 필터링 연동
      if (activeSubCategory !== 'all') {
        const activeCatData = QUICK_CATEGORIES.find(c => c.id === activeSubCategory);
        if (activeCatData && product.category !== activeCatData.categoryKey) {
          return false;
        }
      }
    } else {
      // 일반 카탈로그 필터링
      if (activeCategory !== 'all') {
        if (product.category !== activeCategory) return false;
      }

      // 지속가능먹거리 카테고리일 때 사이드바 상세 필터 다중 연산
      if (activeCategory === 'earth-diet') {
        // (1) 세부 카테고리
        if (activeEarthSubCategory !== 'all') {
          if (product.earthSubCategory !== activeEarthSubCategory) return false;
        }
        
        // (2) 혜택 다중 체크 필터
        if (selectedBenefits.length > 0) {
          const passBenefit = selectedBenefits.every(benefit => {
            if (benefit === 'shipping') return product.freeShipping === true;
            if (benefit === 'group') return product.groupDiscount === true;
            if (benefit === 'discount') return product.badges && product.badges.includes('sale');
            return true;
          });
          if (!passBenefit) return false;
        }

        // (3) 브랜드 다중 체크 필터
        if (selectedBrands.length > 0) {
          if (!selectedBrands.includes(product.brand)) return false;
        }
      }
    }

    // 1-2. 검색어 필터
    if (searchQuery) {
      const nameMatch = product.name.toLowerCase().includes(searchQuery);
      const brandMatch = product.brand.toLowerCase().includes(searchQuery);
      if (!nameMatch && !brandMatch) return false;
    }

    // 1-3. 알레르기 안심 필터 (체크된 성분이 제품의 allergens에 단 하나라도 들어있으면 제외)
    if (excludedAllergens.length > 0) {
      const hasAllergen = excludedAllergens.some(allergen => product.allergens.includes(allergen));
      if (hasAllergen) return false;
    }

    return true;
  });

  // 2. 정렬 처리
  if (activeSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // 'popular' 순 정렬 (인기 배지가 있으면 우선 정렬)
    filtered.sort((a, b) => {
      const aScore = a.badges.includes('popular') ? 2 : (a.badges.includes('earth') ? 1 : 0);
      const bScore = b.badges.includes('popular') ? 2 : (b.badges.includes('earth') ? 1 : 0);
      return bScore - aScore;
    });
  }

  // 개수 갱신
  if (countLabel) {
    countLabel.textContent = filtered.length;
  }

  // 3열 와이드 그리드 클래스 제어 (신상품 뷰 전용)
  if (currentSubpageMode === 'new') {
    grid.classList.add('grid-new-layout');
  } else {
    grid.classList.remove('grid-new-layout');
  }

  // 3. 카드 HTML 생성 및 주입
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-light);">
        <i class="fas fa-search-minus" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>조건에 맞는 급식 식자재가 없습니다.<br>검색어 또는 알레르기 필터를 변경해 보세요.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach((product, index) => {
    // 배지 HTML 생성
    let badgesHtml = '';
    product.badges.forEach(badge => {
      let label = '';
      if (badge === 'earth') label = '지구식단';
      if (badge === 'organic') label = '친환경';
      if (badge === 'popular') label = '인기';
      if (badge === 'sale') label = '세일';
      if (badge === 'new') label = '신상품';
      badgesHtml += `<span class="badge ${badge}">${label}</span>`;
    });

    // 알레르기 유발 표시 HTML 구성
    let allergyHtml = '';
    if (product.allergens.length > 0) {
      allergyHtml += product.allergens.map(a => `<span class="allergy-badge has-allergen">${a}</span>`).join('');
    } else {
      allergyHtml += '<span class="allergy-badge">알레르기 無</span>';
    }

    // 랭킹 번호 마크업 (베스트 인기 뷰 전용)
    let rankHtml = '';
    if (currentSubpageMode === 'best') {
      const rankNum = String(index + 1).padStart(2, '0');
      rankHtml = `<div class="rank-num">${rankNum}_</div>`;
    }

    // 평점/리뷰 메타 마크업 (신상품 뷰 전용)
    let metaHtml = '';
    if (currentSubpageMode === 'new') {
      const rating = product.rating || 4.8;
      const reviewCount = product.reviewCount || 150;
      metaHtml = `
        <div class="product-meta-row">
          <span class="star-rating"><i class="fas fa-star"></i> ${rating.toFixed(1)}</span>
          <span class="review-count"><i class="far fa-comment-dots"></i> ${reviewCount}</span>
        </div>
      `;
    }

    // 할인 가격 표시 처리
    let priceHtml = '';
    if (product.badges.includes('sale') && product.originalPrice) {
      const discountRate = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      priceHtml = `
        <div class="price-box price-row-sale">
          <span class="price-label">예상 납품단가</span>
          <span class="original-price-val">${product.originalPrice.toLocaleString()}원</span>
          <span class="price-val">
            <span class="sale-discount-badge" style="${currentSubpageMode === 'best' || currentSubpageMode === 'sale' ? 'font-size:20px; font-weight:800;' : ''}">${discountRate}%</span>${product.price.toLocaleString()}<span>원</span>
          </span>
        </div>
      `;
    } else {
      priceHtml = `
        <div class="price-box">
          <span class="price-label">예상 납품단가</span>
          <span class="price-val">${product.price.toLocaleString()}<span>원</span></span>
        </div>
      `;
    }

    // 신상품은 신상 카드 스타일 가미
    const cardClass = currentSubpageMode === 'new' ? 'product-card new-style animate-fade-in-up' : 'product-card animate-fade-in-up';

    html += `
      <div class="${cardClass}">
        ${rankHtml}
        <div class="product-badge">${badgesHtml}</div>
        <div class="product-image-wrapper" onclick="openProductModal(${product.id})">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-name" onclick="openProductModal(${product.id})" style="cursor:pointer;">${product.name}</h3>
          <span class="product-spec">${product.spec}</span>
          <div class="allergy-tags">
            ${allergyHtml}
          </div>
          ${metaHtml}
          <div class="product-price-row" style="margin-top: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            ${priceHtml}
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-wish-toggle" onclick="toggleWishlist(this)" title="찜하기">
                <i class="far fa-heart"></i>
              </button>
              <button class="btn-add-quote" onclick="addToCart(${product.id})" title="견적 가방에 담기" style="position: static; transform: none;">
                <i class="fas fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// 상품 상세조회 모달 열기
function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const container = document.getElementById('modalContentContainer');
  if (!container) return;

  // 알레르기 안내 박스 HTML 구성
  let allergyAlertHtml = '';
  if (product.allergens.length > 0) {
    allergyAlertHtml = `
      <div class="allergy-alert-box">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="allergy-alert-desc">
          이 제품은 <span class="allergy-alert-list">${product.allergens.join(', ')}</span> 성분을 함유하고 있습니다. 
          식단 설계 시 민감한 학생들의 알레르기 정보를 다시 한번 확인하여 주십시오.
        </div>
      </div>
    `;
  } else {
    allergyAlertHtml = `
      <div class="allergy-alert-box" style="background-color: #ecfdf5; border-color: #10b981;">
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        <div class="allergy-alert-desc" style="color: #065f46;">
          의무 표시 대상 19대 알레르기 유발 성분이 포함되어 있지 않은 <strong>알레르기 안심 제품</strong>입니다.
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="modal-product-layout">
      <div class="modal-img-box">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-details">
        <span class="modal-brand">${product.brand}</span>
        <h2 class="modal-name">${product.name}</h2>
        <span class="modal-spec-badge">규격: ${product.spec}</span>
        
        <div style="margin-bottom: 24px;">
          ${(() => {
            if (product.badges.includes('sale') && product.originalPrice) {
              const discountRate = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return `
                <div class="price-box price-row-sale">
                  <span class="price-label">예상 대리점 납품가</span>
                  <span class="original-price-val" style="font-size: 13px;">${product.originalPrice.toLocaleString()}원</span>
                  <span class="price-val" style="font-size: 26px; color: var(--primary-color);">
                    <span class="sale-discount-badge" style="font-size: 26px;">${discountRate}%</span>${product.price.toLocaleString()}<span>원</span>
                  </span>
                </div>
              `;
            } else {
              return `
                <div class="price-box">
                  <span class="price-label">예상 대리점 납품가</span>
                  <span class="price-val" style="font-size: 26px; color: var(--primary-color);">
                    ${product.price.toLocaleString()}<span>원</span>
                  </span>
                </div>
              `;
            }
          })()}
        </div>

        <div style="display: flex; gap: 16px; margin-bottom: 24px;">
          <div class="qty-control" style="height: 48px; border-radius: var(--radius-sm);">
            <button class="qty-btn" id="modalQtyMinus" style="width: 40px; font-size: 16px;">-</button>
            <span class="qty-val" id="modalQtyVal" style="font-size: 16px; min-width: 40px;">1</span>
            <button class="qty-btn" id="modalQtyPlus" style="width: 40px; font-size: 16px;">+</button>
          </div>
          <button class="btn-quote-nav" id="modalAddBtn" style="flex-grow: 1; border-radius: var(--radius-sm); font-size: 16px; height: 48px;">
            견적 가방에 담기
          </button>
        </div>

        ${allergyAlertHtml}
      </div>
    </div>

    <!-- 영양성분 정보 및 상세설명 -->
    <div class="modal-section">
      <h3 class="modal-section-title">제품 상세설명</h3>
      <p style="font-size: 14px; color: var(--text-muted); line-height: 1.8; margin-bottom: 24px;">
        ${product.description}
      </p>
    </div>

    <div class="modal-section">
      <h3 class="modal-section-title">영양성분표 (1회 제공량 기준)</h3>
      <div class="nutrition-grid">
        <div class="nutrition-item">
          <div class="nutrition-label">열량</div>
          <div class="nutrition-val">${product.nutrition.calories}</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">탄수화물</div>
          <div class="nutrition-val">${product.nutrition.carbs}</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">단백질</div>
          <div class="nutrition-val">${product.nutrition.protein}</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-label">지방</div>
          <div class="nutrition-val">${product.nutrition.fat}</div>
        </div>
      </div>
    </div>
  `;

  // 모달 내 수량 조절 이벤트 리스너
  let currentQty = 1;
  const qtyVal = document.getElementById('modalQtyVal');
  const btnMinus = document.getElementById('modalQtyMinus');
  const btnPlus = document.getElementById('modalQtyPlus');
  const btnAdd = document.getElementById('modalAddBtn');

  btnMinus.addEventListener('click', () => {
    if (currentQty > 1) {
      currentQty--;
      qtyVal.textContent = currentQty;
    }
  });

  btnPlus.addEventListener('click', () => {
    currentQty++;
    qtyVal.textContent = currentQty;
  });

  btnAdd.addEventListener('click', () => {
    addToCart(product.id, currentQty);
    closeProductModal();
  });

  // 모달 창 노출
  document.getElementById('productDetailModal').classList.add('open');
}

// 모달 창 닫기
function closeProductModal() {
  document.getElementById('productDetailModal').classList.remove('open');
}
