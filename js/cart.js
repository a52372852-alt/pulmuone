// 장바구니 로컬스토리지 키
const CART_STORAGE_KEY = 'pulmuone_meal_cart';

// 장바구니 상태 관리
let cartState = [];

// 장바구니 데이터 로드
function loadCart() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  cartState = data ? JSON.parse(data) : [];
  updateCartBadge();
}

// 장바구니 데이터 저장
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  updateCartBadge();
  renderCartDrawerItems();
}

// 장바구니에 상품 추가
function addToCart(productId, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cartState.findIndex(item => item.id === productId);

  if (existingItemIndex > -1) {
    cartState[existingItemIndex].quantity += quantity;
  } else {
    cartState.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      spec: product.spec,
      price: product.price,
      image: product.image,
      allergens: product.allergens,
      quantity: quantity
    });
  }

  saveCart();
  showToast(`${product.name}이(가) 견적 가방에 담겼습니다.`);
  openCartDrawer();
}

// 식단표 일괄 추가
function addMenuToCart(menuId) {
  const menu = MENU_RECOMMENDATIONS.find(m => m.id === menuId);
  if (!menu) return;

  let addedCount = 0;
  menu.productIds.forEach(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (product) {
      const existingItem = cartState.find(item => item.id === id);
      if (!existingItem) {
        cartState.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          spec: product.spec,
          price: product.price,
          image: product.image,
          allergens: product.allergens,
          quantity: 1
        });
        addedCount++;
      }
    }
  });

  saveCart();
  if (addedCount > 0) {
    showToast(`'${menu.title}' 식단 상품이 견적 가방에 추가되었습니다.`);
  } else {
    showToast(`이미 모든 상품이 견적 가방에 담겨 있습니다.`);
  }
  openCartDrawer();
}

// 장바구니 품목 수량 업데이트
function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const itemIndex = cartState.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    cartState[itemIndex].quantity = quantity;
    saveCart();
  }
}

// 장바구니 상품 제거
function removeFromCart(productId) {
  cartState = cartState.filter(item => item.id !== productId);
  saveCart();
}

// 헤더의 장바구니 배지 카운트 업데이트
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count');
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  
  badges.forEach(badge => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  });
}

// 장바구니 합계 계산
function getCartSummary() {
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalCount, totalPrice };
}

// 장바구니 드로어 열기
function openCartDrawer() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.classList.add('open');
    renderCartDrawerItems();
  }
}

// 장바구니 드로어 닫기
function closeCartDrawer() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
}

// 드로어 내 아이템 렌더링
function renderCartDrawerItems() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  if (cartState.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <i class="fas fa-shopping-basket"></i>
        <p>견적 가방이 비어 있습니다.<br>상품을 담아 견적을 요청해 보세요!</p>
      </div>
    `;
    
    // 푸터 비활성화 또는 값 초기화
    document.getElementById('totalItemsCount').textContent = '0개';
    document.getElementById('totalCartPrice').textContent = '0원';
    document.getElementById('checkoutBtn').style.pointerEvents = 'none';
    document.getElementById('checkoutBtn').style.opacity = '0.5';
    return;
  }

  document.getElementById('checkoutBtn').style.pointerEvents = 'auto';
  document.getElementById('checkoutBtn').style.opacity = '1';

  let html = '';
  cartState.forEach(item => {
    const formattedPrice = (item.price * item.quantity).toLocaleString();
    html += `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <span class="cart-item-brand">${item.brand}</span>
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-spec">${item.spec}</span>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <span class="cart-item-price">${formattedPrice}원</span>
          </div>
        </div>
        <button class="btn-remove-item" onclick="removeFromCart(${item.id})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;

  // 요약 정보 반영
  const { totalCount, totalPrice } = getCartSummary();
  document.getElementById('totalItemsCount').textContent = `${totalCount}개`;
  document.getElementById('totalCartPrice').textContent = `${totalPrice.toLocaleString()}원`;
}

// 미니 토스트 메시지 알림
function showToast(message) {
  // 이미 존재하는 토스트가 있다면 제거
  const oldToast = document.querySelector('.toast-notification');
  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background-color: rgba(34, 66, 19, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(120, 185, 51, 0.3);
  `;
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #78B933;"></i> ${message}`;
  
  document.body.appendChild(toast);
  
  // 브라우저 렌더링 강제 실행 후 애니메이션 시작
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  // 2.5초 후 페이드 아웃 후 삭제
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

// 드로어 주입 및 초기화
function initCartDrawer() {
  // 이미 주입되어 있지 않다면
  if (!document.getElementById('cartOverlay')) {
    const drawerHtml = `
      <div class="cart-drawer-overlay" id="cartOverlay">
        <div class="cart-drawer">
          <div class="drawer-header">
            <h3>
              <i class="fas fa-file-invoice" style="color: var(--primary-color);"></i> 견적 가방
            </h3>
            <button class="btn-close-drawer" id="closeCartBtn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="drawer-content" id="cartItemsContainer">
            <!-- 동적 삽입 -->
          </div>
          <div class="drawer-footer">
            <div class="summary-row">
              <span>담은 수량</span>
              <span id="totalItemsCount">0개</span>
            </div>
            <div class="summary-row total">
              <span>예상 견적총액</span>
              <span class="price" id="totalCartPrice">0원</span>
            </div>
            <a href="quote.html" class="btn-request-quote" id="checkoutBtn">상세 견적서 신청하기</a>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    // 이벤트 리스너 연결
    document.getElementById('closeCartBtn').addEventListener('click', closeCartDrawer);
    document.getElementById('cartOverlay').addEventListener('click', function(e) {
      if (e.target === this) {
        closeCartDrawer();
      }
    });

    // 헤더의 장바구니 토글 버튼들에 이벤트 바인딩
    const toggles = document.querySelectorAll('.btn-cart-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });
  }

  loadCart();
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  
  // 스크롤 시 헤더 변경 이벤트
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 1. 카테고리 드롭다운 토글 및 외부 클릭시 닫기 기능
  const megaMenuToggleBtn = document.getElementById('megaMenuToggleBtn');
  const megaDropdownPanel = document.getElementById('megaDropdownPanel');
  
  if (megaMenuToggleBtn && megaDropdownPanel) {
    megaMenuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      megaDropdownPanel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!megaDropdownPanel.contains(e.target) && e.target !== megaMenuToggleBtn) {
        megaDropdownPanel.classList.remove('open');
      }
    });
  }

  // 2. 미구현 카테고리 알림 토스트 전역 이벤트 핸들링
  document.addEventListener('click', (e) => {
    const unimplementedLink = e.target.closest('.btn-unimplemented-cat');
    if (unimplementedLink) {
      e.preventDefault();
      showToast('해당 카테고리는 현재 학교 급식용 대용량 식자재가 준비 중입니다.');
      
      // 카테고리 드롭다운 패널이 열려 있다면 닫음
      if (megaDropdownPanel) {
        megaDropdownPanel.classList.remove('open');
      }
    }
  });
});
