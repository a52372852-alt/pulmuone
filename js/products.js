// 카탈로그 필터링 및 상세 모달 제어

let activeCategory = 'all';
let searchQuery = '';
let excludedAllergens = [];
let activeSort = 'popular';

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
        const categoryTabs = document.querySelectorAll('.category-tab-btn');
        categoryTabs.forEach(t => {
          if (t.getAttribute('data-category') === 'all') {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
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

// URL 쿼리 파라미터 파싱
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  
  // 카테고리 필터 파라미터 처리
  const filterParam = params.get('filter');
  if (filterParam) {
    activeCategory = filterParam;
    const tab = document.querySelector(`.category-tab-btn[data-category="${filterParam}"]`);
    if (tab) {
      document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }
  }

  // 특정 상품 상세 파라미터 처리
  const idParam = params.get('id');
  if (idParam) {
    const productId = parseInt(idParam);
    setTimeout(() => {
      openProductModal(productId);
    }, 300); // 렌더링 후 약간의 딜레이 뒤 모달 오픈
  }
}

// 상품 필터링 및 렌더링 핵심 로직
function filterAndRenderProducts() {
  const grid = document.getElementById('productCatalogGrid');
  const countLabel = document.getElementById('productCount');
  if (!grid) return;

  // 1. 필터링 처리
  let filtered = PRODUCTS.filter(product => {
    // 1-1. 카테고리 필터
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
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
  filtered.forEach(product => {
    // 배지 HTML 생성
    let badgesHtml = '';
    product.badges.forEach(badge => {
      let label = '';
      if (badge === 'earth') label = '지구식단';
      if (badge === 'organic') label = '친환경';
      if (badge === 'popular') label = '인기';
      badgesHtml += `<span class="badge ${badge}">${label}</span>`;
    });

    // 알레르기 유발 표시 HTML 구성
    let allergyHtml = '';
    if (product.allergens.length > 0) {
      allergyHtml += product.allergens.map(a => `<span class="allergy-badge has-allergen">${a}</span>`).join('');
    } else {
      allergyHtml += '<span class="allergy-badge">알레르기 無</span>';
    }

    html += `
      <div class="product-card animate-fade-in-up">
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
          <div class="product-price-row">
            <div class="price-box">
              <span class="price-label">예상 납품단가</span>
              <span class="price-val">${product.price.toLocaleString()}<span>원</span></span>
            </div>
            <button class="btn-add-quote" onclick="addToCart(${product.id})" title="견적 가방에 담기">
              <i class="fas fa-cart-plus"></i>
            </button>
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
        
        <div class="price-box" style="margin-bottom: 24px;">
          <span class="price-label">예상 대리점 납품가</span>
          <span class="price-val" style="font-size: 26px; color: var(--primary-color);">
            ${product.price.toLocaleString()}<span>원</span>
          </span>
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
