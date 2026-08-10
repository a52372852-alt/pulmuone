// 견적 신청 페이지 비즈니스 로직 및 폼 제출 제어

document.addEventListener('DOMContentLoaded', () => {
  initQuotePage();
  
  // 희망 납품일 최소 선택 가능 날짜 설정 (오늘부터 3일 이후부터 선택 가능하게)
  const deliveryDateInput = document.getElementById('deliveryStartDate');
  if (deliveryDateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    deliveryDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // 테스트 자동입력 버튼 기능 연결
  const btnFillDemo = document.getElementById('btnFillDemo');
  if (btnFillDemo) {
    btnFillDemo.addEventListener('click', () => {
      document.getElementById('schoolName').value = '안심초등학교';
      document.getElementById('officeOfEducation').value = '서울특별시교육청';
      document.getElementById('teacherName').value = '김영양';
      document.getElementById('teacherTel').value = '010-1234-5678';
      document.getElementById('teacherEmail').value = 'teacher@ansim.es.kr';
      document.getElementById('mealCount').value = '650';
      
      // 오늘부터 5일 뒤 날짜로 세팅
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 5);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      document.getElementById('deliveryStartDate').value = `${yyyy}-${mm}-${dd}`;
      
      document.getElementById('extraRequest').value = '알레르기 보유 원아용 대체 식자재 단가 문의';
    });
  }
});

// 페이지 초기 렌더링 판단
function initQuotePage() {
  loadCart(); // cart.js 로드 필요
  
  const layout = document.getElementById('quoteLayout');
  const emptyState = document.getElementById('quoteEmptyState');
  
  if (!layout || !emptyState) return;

  if (cartState.length === 0) {
    layout.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    layout.style.display = 'grid';
    emptyState.style.display = 'none';
    renderQuoteSummary();
  }
}

// 요약 영역 렌더링
function renderQuoteSummary() {
  const itemsContainer = document.getElementById('quoteSummaryItems');
  const totalCountEl = document.getElementById('summaryTotalCount');
  const totalPriceEl = document.getElementById('summaryTotalPrice');
  const allergyReportEl = document.getElementById('quoteAllergyReport');
  
  if (!itemsContainer) return;

  // 1. 아이템 목록 렌더링
  let html = '';
  let allAllergens = new Set();
  
  cartState.forEach(item => {
    html += `
      <div class="summary-product-item">
        <span class="summary-product-name" title="${item.name}">${item.name}</span>
        <span class="summary-product-qty">${item.spec} / ${item.quantity}개</span>
      </div>
    `;
    
    // 알레르기 물질 수집
    if (item.allergens && item.allergens.length > 0) {
      item.allergens.forEach(a => allAllergens.add(a));
    }
  });

  itemsContainer.innerHTML = html;

  // 2. 금액 및 수량 요약
  const { totalCount, totalPrice } = getCartSummary();
  totalCountEl.textContent = `${totalCount}개`;
  totalPriceEl.textContent = `${totalPrice.toLocaleString()}원`;

  // 3. 알레르기 브리핑 리포트 분석 및 렌더링 (핵심 B2B 특성)
  if (allAllergens.size > 0) {
    const allergenList = Array.from(allAllergens).join(', ');
    allergyReportEl.innerHTML = `
      신청하신 식자재에 <span>${allergenList}</span> 성분이 포함되어 있습니다.<br>
      해당 성분에 알레르기가 있는 원아/학생들의 식단 대체 조리를 사전에 검토해 주시기 바랍니다.
    `;
    allergyReportEl.style.color = '#7b341e';
  } else {
    allergyReportEl.innerHTML = `
      <span style="color: #10b981;"><i class="fas fa-circle-check"></i> 알레르기 프리 안심 식단</span><br>
      현재 담긴 식자재에는 19대 의무 알레르기 유발 물질이 포함되어 있지 않아 매우 안전합니다.
    `;
    allergyReportEl.style.color = '#065f46';
  }
}

// 견적 제출 처리
function handleQuoteSubmit(event) {
  event.preventDefault();

  // 폼 필드 파싱
  const schoolName = document.getElementById('schoolName').value.trim();
  const teacherName = document.getElementById('teacherName').value.trim();
  const teacherTel = document.getElementById('teacherTel').value.trim();
  const teacherEmail = document.getElementById('teacherEmail').value.trim();
  const mealCount = document.getElementById('mealCount').value;
  const deliveryStartDate = document.getElementById('deliveryStartDate').value;
  const deliveryCycle = document.getElementById('deliveryCycle').options[document.getElementById('deliveryCycle').selectedIndex].text;
  const extraRequest = document.getElementById('extraRequest').value.trim();

  // 가상의 접수번호 및 날짜 생성
  const receiptNo = 'PM-' + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date();
  const requestDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 견적서 데이터 객체 생성 및 LocalStorage 저장
  const cartSummary = getCartSummary();
  const quoteData = {
    receiptNo,
    requestDate,
    schoolName,
    teacherName,
    teacherTel,
    teacherEmail,
    mealCount,
    deliveryStartDate,
    deliveryCycle,
    extraRequest,
    totalCount: cartSummary.totalCount,
    totalPrice: cartSummary.totalPrice,
    status: '매칭 중',
    items: cartState.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      spec: item.spec,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      allergens: item.allergens || []
    }))
  };

  const existingQuotesStr = localStorage.getItem('pulmuone_quote_requests');
  let existingQuotes = existingQuotesStr ? JSON.parse(existingQuotesStr) : [];
  existingQuotes.unshift(quoteData); // 최신 접수건이 맨 위로
  localStorage.setItem('pulmuone_quote_requests', JSON.stringify(existingQuotes));

  // 견적서 정보 취합 로그 출력
  console.log('--- B2B 납품 견적서 신청 접수 완료 ---');
  console.log('접수번호:', receiptNo);
  console.log('학교명:', schoolName);
  console.log('영양교사:', teacherName);
  console.log('연락처:', teacherTel);
  console.log('이메일:', teacherEmail);
  console.log('급식식수:', mealCount, '명');
  console.log('희망납품일:', deliveryStartDate);
  console.log('배송주기:', deliveryCycle);
  console.log('품목수:', cartState.length, '개');
  console.log('예상총액:', getCartSummary().totalPrice, '원');
  console.log('요청사항:', extraRequest);

  // 로컬 장바구니 비우기
  localStorage.removeItem(CART_STORAGE_KEY);
  cartState = [];
  updateCartBadge();

  // 완료 성공 화면 치환
  const mainContent = document.getElementById('quoteMainContent');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="success-container animate-fade-in-up">
        <div class="success-icon">
          <i class="fas fa-check-double"></i>
        </div>
        <h2 class="success-title">급식 단가 견적 요청 완료</h2>
        <p class="success-desc">
          <strong>${teacherName} 영양교사님</strong>, 요청하신 B2B 견적서가 정상적으로 접수되었습니다.<br>
          담당 학교별 급식 전문 대리점 매니저가 검토 후 신속히 연락드리겠습니다.
        </p>

        <div style="background-color: var(--bg-main); border-radius: var(--radius-md); padding: 24px; text-align: left; margin-bottom: 32px; border: 1px solid var(--border-light); font-size: 14px; line-height: 1.8;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-light)">접수번호</span>
            <strong style="font-family:'Outfit'; color:var(--secondary-color)">${receiptNo}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-light)">신청 일시</span>
            <strong>${requestDate}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--text-light)">기관명</span>
            <strong>${schoolName} (급식인원: ${mealCount}명)</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-light)">진행단계</span>
            <span style="color:var(--primary-color); font-weight:700;"><i class="fas fa-clock"></i> 대리점 매니저 매칭 중</span>
          </div>
        </div>

        <div style="display: flex; gap: 16px; justify-content: center;">
          <a href="index.html" class="btn-hero-secondary" style="color: var(--text-dark); border-color: var(--border-color); background-color: var(--bg-main); padding: 14px 28px; font-size:14px;">홈으로 가기</a>
          <a href="products.html" class="btn-quote-nav" style="padding: 14px 28px; font-size:14px; display:flex; align-items:center;">추가 상품 둘러보기</a>
        </div>
      </div>
    `;
  }
}
