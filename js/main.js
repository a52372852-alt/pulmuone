// 메인 페이지 초기화 및 렌더링

document.addEventListener('DOMContentLoaded', () => {
  renderMenuRecommendations();
  initCounterAnimation();
});

// 추천 식단 카드 동적 렌더링
function renderMenuRecommendations() {
  const container = document.getElementById('menuRecommendationsContainer');
  if (!container) return;

  let html = '';
  MENU_RECOMMENDATIONS.forEach(menu => {
    // 식단에 속한 제품 이미지 썸네일들 구성
    let thumbsHtml = '';
    menu.productIds.forEach(id => {
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        thumbsHtml += `
          <div class="menu-item-thumb" data-name="${product.name}" onclick="location.href='products.html?id=${product.id}'">
            <img src="${product.image}" alt="${product.name}">
          </div>
        `;
      }
    });

    html += `
      <div class="menu-card animate-fade-in-up">
        <div class="menu-card-header">
          <span class="menu-tag">${menu.tag}</span>
          <span class="menu-target">${menu.target}</span>
          <h3 class="menu-title">${menu.title}</h3>
        </div>
        <div class="menu-card-body">
          <p class="menu-desc">${menu.desc}</p>
          <div class="menu-items-preview">
            ${thumbsHtml}
          </div>
          <button class="btn-add-menu" onclick="addMenuToCart('${menu.id}')">
            <i class="fas fa-file-signature"></i> 식재료 일괄 견적 담기
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 실시간 숫자 카운터 애니메이션 (Intersection Observer 활용)
function initCounterAnimation() {
  const counterItems = document.querySelectorAll('.count-num');
  if (counterItems.length === 0) return;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1500; // 1.5초 동안 애니메이션
    const stepTime = 15;
    const steps = duration / stepTime;
    const stepVal = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepVal;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, stepTime);
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target); // 한번만 실행
      }
    });
  }, {
    threshold: 0.5 // 50% 노출되었을 때 실행
  });

  counterItems.forEach(item => observer.observe(item));
}

// 모바일 메뉴 토글
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '80px';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.backgroundColor = 'white';
        navMenu.style.padding = '20px';
        navMenu.style.borderBottom = '1px solid var(--border-color)';
        navMenu.style.zIndex = '999';
        navMenu.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)';
      }
    }
  });
}
