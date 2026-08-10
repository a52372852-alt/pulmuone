// 어드민 대시보드 비즈니스 로직 및 CRUD 제어

const ADMIN_SESSION_KEY = 'pulmuone_admin_session';
const QUOTE_STORAGE_KEY = 'pulmuone_quote_requests';
const PARTNER_USERS_KEY = 'pulmuone_partner_users';

// 초기 샘플 급식 파트너 회원 데이터
const DEMO_PARTNER_USERS = [
  {
    joinDate: '2026-08-10 14:15',
    userType: '영양교사/조리사',
    schoolName: '안심초등학교',
    name: '김영양',
    email: 'teacher@ansim.es.kr',
    tel: '010-1234-5678',
    authProvider: '카카오 간편가입',
    status: '승인 완료'
  },
  {
    joinDate: '2026-08-10 10:30',
    userType: '영양교사/조리사',
    schoolName: '서울초등학교',
    name: '홍길동',
    email: 'hong@seoul.es.kr',
    tel: '010-9876-5432',
    authProvider: '일반 회원가입',
    status: '승인 완료'
  },
  {
    joinDate: '2026-08-09 16:45',
    userType: '영양교사/조리사',
    schoolName: '서울중학교',
    name: '박급식',
    email: 'park@seoul.ms.kr',
    tel: '010-3333-5555',
    authProvider: '네이버 간편가입',
    status: '승인 완료'
  },
  {
    joinDate: '2026-08-08 11:20',
    userType: '기업/기관 급식담당',
    schoolName: '한국공공기관 급식실',
    name: '이기업',
    email: 'lee@korea.gov.kr',
    tel: '010-7777-8888',
    authProvider: '전국 교육청 SSO',
    status: '승인 대기'
  },
  {
    joinDate: '2026-08-07 09:10',
    userType: '유치원/어린이집',
    schoolName: '해맑은 유치원',
    name: '최원장',
    email: 'choi@bright.child.kr',
    tel: '010-5555-4444',
    authProvider: '일반 회원가입',
    status: '승인 완료'
  }
];
  {
    receiptNo: 'PM-84920192',
    requestDate: '2026-08-10 14:20',
    schoolName: '안심초등학교',
    teacherName: '김영양',
    teacherTel: '010-1234-5678',
    teacherEmail: 'teacher@ansim.es.kr',
    mealCount: '650',
    deliveryStartDate: '2026-08-15',
    deliveryCycle: '매일 배송',
    extraRequest: '알레르기 보유 원아용 대체 식자재 단가 문의',
    totalCount: 3,
    totalPrice: 154000,
    status: '매칭 중',
    items: [
      { id: 1, name: '풀무원 바른선 국산콩 두부 (대용량)', brand: '풀무원 바른선', spec: '3kg (1입)', price: 14500, quantity: 4, subtotal: 58000, allergens: ['대두'] },
      { id: 3, name: '풀무원 무농약 콩나물 (업소용)', brand: '풀무원 바른선', spec: '2kg (1입)', price: 9800, quantity: 5, subtotal: 49000, allergens: ['대두'] },
      { id: 4, name: '풀무원 동물복지 무항생제 유정란 1호', brand: '풀무원 바른선', spec: '30구 (판)', price: 11750, quantity: 4, subtotal: 47000, allergens: ['난류'] }
    ]
  },
  {
    receiptNo: 'PM-73821094',
    requestDate: '2026-08-10 11:05',
    schoolName: '서울중학교',
    teacherName: '박급식',
    teacherTel: '010-9876-5432',
    teacherEmail: 'park@seoul.ms.kr',
    mealCount: '800',
    deliveryStartDate: '2026-08-18',
    deliveryCycle: '주 3회 배송',
    extraRequest: '지속가능 먹거리 친환경 인증서 사본 제출 희망',
    totalCount: 2,
    totalPrice: 216000,
    status: '납품 승인 완료',
    items: [
      { id: 2, name: '지구식단 식물성 떡갈비 (단체급식용)', brand: '풀무원 지구식단', spec: '1kg (20개입)', price: 18000, quantity: 8, subtotal: 144000, allergens: ['대두', '밀'] },
      { id: 6, name: '아임리얼 생과일 착즙주스 딸기', brand: '아임리얼', spec: '190ml*20입', price: 36000, quantity: 2, subtotal: 72000, allergens: [] }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  bindAdminEvents();
});

// 견적 요청 데이터 로컬스토리지 입출력
function getQuoteRequests() {
  const dataStr = localStorage.getItem(QUOTE_STORAGE_KEY);
  if (!dataStr) {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(DEMO_QUOTE_REQUESTS));
    return DEMO_QUOTE_REQUESTS;
  }
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return [];
  }
}

function saveQuoteRequests(quotes) {
  localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(quotes));
  updateQuoteBadgeCount();
}

// 파트너 회원 데이터 로컬스토리지 입출력
function getPartnerUsers() {
  const dataStr = localStorage.getItem(PARTNER_USERS_KEY);
  if (!dataStr) {
    localStorage.setItem(PARTNER_USERS_KEY, JSON.stringify(DEMO_PARTNER_USERS));
    return DEMO_PARTNER_USERS;
  }
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return [];
  }
}

function savePartnerUsers(users) {
  localStorage.setItem(PARTNER_USERS_KEY, JSON.stringify(users));
  updateUserBadgeCount();
}

function updateUserBadgeCount() {
  const badge = document.getElementById('userBadgeCount');
  if (badge) {
    const users = getPartnerUsers();
    badge.textContent = users.length;
  }
}

// 탭 전환 제어
function switchAdminTab(tabName) {
  const btnProducts = document.getElementById('tabBtnProducts');
  const btnQuotes = document.getElementById('tabBtnQuotes');
  const btnUsers = document.getElementById('tabBtnUsers');

  const contentProducts = document.getElementById('tabContentProducts');
  const contentQuotes = document.getElementById('tabContentQuotes');
  const contentUsers = document.getElementById('tabContentUsers');

  if (!btnProducts || !btnQuotes || !contentProducts || !contentQuotes) return;

  if (btnProducts) btnProducts.classList.remove('active');
  if (btnQuotes) btnQuotes.classList.remove('active');
  if (btnUsers) btnUsers.classList.remove('active');

  if (contentProducts) contentProducts.style.display = 'none';
  if (contentQuotes) contentQuotes.style.display = 'none';
  if (contentUsers) contentUsers.style.display = 'none';

  if (tabName === 'products') {
    if (btnProducts) btnProducts.classList.add('active');
    if (contentProducts) contentProducts.style.display = 'block';
    renderAdminProducts();
  } else if (tabName === 'quotes') {
    if (btnQuotes) btnQuotes.classList.add('active');
    if (contentQuotes) contentQuotes.style.display = 'block';
    renderAdminQuotes();
  } else if (tabName === 'users') {
    if (btnUsers) btnUsers.classList.add('active');
    if (contentUsers) contentUsers.style.display = 'block';
    renderUserTable();
  }
}

// 상단 견적 수량 배지 갱신
function updateQuoteBadgeCount() {
  const badge = document.getElementById('quoteBadgeCount');
  if (badge) {
    const quotes = getQuoteRequests();
    badge.textContent = quotes.length;
  }
}

// 관리자 로그인 상태 확인
function checkAdminAuth() {
  const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');

  if (!loginSection || !dashboardSection) return;

  if (isLogged) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    updateQuoteBadgeCount();
    updateUserBadgeCount();
    renderAdminProducts();
    bindAdminEvents();
  } else {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
  }
}


// 로그인 액션
function handleAdminLogin(event) {
  event.preventDefault();
  const passwordInput = document.getElementById('adminPassword');
  const errorMsg = document.getElementById('loginErrorMsg');

  if (passwordInput.value === 'admin123') {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    passwordInput.value = '';
    errorMsg.style.display = 'none';
    checkAdminAuth();
    if (typeof showToast === 'function') {
      showToast('관리자 세션이 시작되었습니다.');
    }
  } else {
    errorMsg.style.display = 'block';
  }
}

// 로그아웃 액션
function handleAdminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  checkAdminAuth();
  if (typeof showToast === 'function') {
    showToast('관리자 모드가 종료되었습니다.');
  }
}

// 이벤트 리스너 바인딩
function bindAdminEvents() {
  // 로그아웃 버튼
  const logoutBtn = document.getElementById('btnAdminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleAdminLogout);
  }

  // 모달 열기 버튼 (신규 등록)
  const openAddBtn = document.getElementById('btnOpenAddModal');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => openProductFormModal());
  }

  // 모달 닫기 및 취소 버튼
  const closeBtn = document.getElementById('closeFormModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductFormModal);
  }
  const cancelBtn = document.getElementById('btnCancelFormModal');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeProductFormModal);
  }

  // 모달 외부 클릭 시 닫기
  const modalOverlay = document.getElementById('productFormModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeProductFormModal();
      }
    });
  }

  // 이미지 주소 수동 입력 시 미리보기 동기화
  const imgUrlInput = document.getElementById('formProdImageUrl');
  if (imgUrlInput) {
    imgUrlInput.addEventListener('input', (e) => {
      updateImagePreview(e.target.value);
    });
  }
}

// 대시보드 상품 카탈로그 테이블 렌더링
function renderAdminProducts() {
  const tableBody = document.getElementById('adminProductTableBody');
  if (!tableBody) return;

  const currentProducts = getProducts();

  if (currentProducts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-cubes" style="font-size: 36px; margin-bottom: 12px;"></i>
          <p>등록된 급식 식자재가 없습니다. 새 식자재를 추가해 보세요.</p>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  currentProducts.forEach(product => {
    // 카테고리 한글 치환
    let catKor = '기타';
    if (product.category === 'earth-diet') catKor = '지속가능먹거리';
    else if (product.category === 'tofu-vegetables') catKor = '두부·콩나물·달걀';
    else if (product.category === 'vegetables') catKor = '과일·채소·쌀';
    else if (product.category === 'processed') catKor = '정육·수산·가공';
    else if (product.category === 'dumpling-noodle') catKor = '만두·피자·면요리';
    else if (product.category === 'soup-side') catKor = '국·탕·반찬·양념';
    else if (product.category === 'snacks') catKor = '과자·간식·음료';
    else if (product.category === 'health') catKor = '건강식품·녹즙';


    html += `
      <tr>
        <td>
          <div class="admin-table-thumb">
            <img src="${product.image}" alt="${product.name}">
          </div>
        </td>
        <td><span style="font-size:12px; font-weight:700; color:var(--primary-color)">${product.brand}</span></td>
        <td><div class="admin-table-name" title="${product.name}">${product.name}</div></td>
        <td><span style="font-size:13px; color:var(--text-muted)">${product.spec}</span></td>
        <td><span class="allergy-badge" style="background-color:var(--primary-light); color:var(--primary-color);">${catKor}</span></td>
        <td><span class="admin-table-price">${product.price.toLocaleString()}원</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-table-edit" onclick="openProductFormModal(${product.id})" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-table-delete" onclick="handleProductDelete(${product.id})" title="삭제">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

// -------------------------------------------------------------
// [견적/주문 접수 내역 관리 비즈니스 로직]
// -------------------------------------------------------------

function renderAdminQuotes() {
  const tableBody = document.getElementById('adminQuoteTableBody');
  if (!tableBody) return;

  const allQuotes = getQuoteRequests();
  const filterVal = document.getElementById('quoteStatusFilter') ? document.getElementById('quoteStatusFilter').value : 'all';

  // 통계 계산 (납품 승인 완료건만 completedCount에 카운팅)
  const totalCount = allQuotes.length;
  const completedCount = allQuotes.filter(q => q.status === '납품 승인 완료').length;
  const pendingCount = totalCount - completedCount;
  const totalAmount = allQuotes.reduce((acc, q) => acc + (q.totalPrice || 0), 0);

  // 요약 카드 갱신
  if (document.getElementById('statTotalQuotes')) document.getElementById('statTotalQuotes').textContent = `${totalCount}건`;
  if (document.getElementById('statPendingQuotes')) document.getElementById('statPendingQuotes').textContent = `${pendingCount}건`;
  if (document.getElementById('statCompletedQuotes')) document.getElementById('statCompletedQuotes').textContent = `${completedCount}건`;
  if (document.getElementById('statTotalAmount')) document.getElementById('statTotalAmount').textContent = `${totalAmount.toLocaleString()}원`;
  updateQuoteBadgeCount();

  // 필터링 적용
  let filteredQuotes = allQuotes;
  if (filterVal !== 'all') {
    filteredQuotes = allQuotes.filter(q => q.status === filterVal);
  }

  if (filteredQuotes.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-inbox" style="font-size: 36px; margin-bottom: 12px;"></i>
          <p>접수된 견적/주문 신청 내역이 없습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filteredQuotes.forEach(quote => {
    const itemsSummary = quote.items && quote.items.length > 0 
      ? (quote.items.length === 1 ? quote.items[0].name : `${quote.items[0].name} 외 ${quote.items.length - 1}건`)
      : '품목 없음';

    // 진행 상태별 클래스 지정 (매칭중: 검정, 견적검토중: 주황, 납품승인완료: 파랑, 상세상담완료: 빨강)
    function getStatusClass(status) {
      if (status === '매칭 중') return 'status-black';
      if (status === '견적 검토 중') return 'status-orange';
      if (status === '상세 상담 완료') return 'status-red';
      if (status === '납품 승인 완료') return 'status-blue';
      return 'status-black';
    }

    // 납품 승인 완료 버튼(옵션)을 제일 아래에 위치
    const statuses = ['매칭 중', '견적 검토 중', '상세 상담 완료', '납품 승인 완료'];
    let statusOptionsHtml = '';
    statuses.forEach(s => {
      const selected = (quote.status === s) ? 'selected' : '';
      statusOptionsHtml += `<option value="${s}" ${selected}>${s}</option>`;
    });

    const currentStatusClass = getStatusClass(quote.status);

    html += `
      <tr>
        <td><strong style="font-family:'Outfit'; color:var(--secondary-color);">${quote.receiptNo}</strong></td>
        <td><span style="font-size:12px; color:var(--text-muted);">${quote.requestDate}</span></td>
        <td><strong style="color:var(--text-dark);">${quote.schoolName}</strong></td>
        <td><span style="font-size:13px;">${quote.teacherName} 교사</span></td>
        <td><span style="font-size:13px; font-weight:700;">${quote.mealCount}명</span></td>
        <td><div class="admin-table-name" title="${itemsSummary}">${itemsSummary}</div></td>
        <td><span class="admin-table-price">${(quote.totalPrice || 0).toLocaleString()}원</span></td>
        <td>
          <select class="status-select ${currentStatusClass}" onchange="handleQuoteStatusChange('${quote.receiptNo}', this.value); updateSelectStatusClass(this);">
            ${statusOptionsHtml}
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-table-edit" onclick="openQuoteDetailModal('${quote.receiptNo}')" title="상세보기">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="btn-table-delete" onclick="handleDeleteQuote('${quote.receiptNo}')" title="삭제">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

// 셀렉트박스 변경 시 즉시 색상 클래스 갱신
function updateSelectStatusClass(selectEl) {
  const status = selectEl.value;
  selectEl.className = 'status-select';
  if (status === '매칭 중') selectEl.classList.add('status-black');
  else if (status === '견적 검토 중') selectEl.classList.add('status-orange');
  else if (status === '납품 승인 완료') selectEl.classList.add('status-blue');
  else if (status === '상세 상담 완료') selectEl.classList.add('status-red');
}

// 진행 상태 변경 함수
function handleQuoteStatusChange(receiptNo, newStatus) {
  const quotes = getQuoteRequests();
  const quote = quotes.find(q => q.receiptNo === receiptNo);
  if (quote) {
    quote.status = newStatus;
    saveQuoteRequests(quotes);
    renderAdminQuotes();
    if (typeof showToast === 'function') {
      showToast(`[${receiptNo}] 접수건 상태가 '${newStatus}'(으)로 변경되었습니다.`);
    }
  }
}

// 접수건 삭제 함수
function handleDeleteQuote(receiptNo) {
  const isConfirmed = confirm(`접수번호 [${receiptNo}] 견적 신청 내역을 삭제하시겠습니까?`);
  if (isConfirmed) {
    const quotes = getQuoteRequests();
    const updated = quotes.filter(q => q.receiptNo !== receiptNo);
    saveQuoteRequests(updated);
    renderAdminQuotes();
    if (typeof showToast === 'function') {
      showToast(`[${receiptNo}] 접수 내역이 삭제되었습니다.`);
    }
  }
}

// 상세 모달 열기
function openQuoteDetailModal(receiptNo) {
  const quotes = getQuoteRequests();
  const quote = quotes.find(q => q.receiptNo === receiptNo);
  if (!quote) return;

  const container = document.getElementById('quoteDetailModalContent');
  const modal = document.getElementById('quoteDetailModal');
  if (!container || !modal) return;

  let itemsRowsHtml = '';
  if (quote.items && quote.items.length > 0) {
    quote.items.forEach((item, idx) => {
      const allergensText = (item.allergens && item.allergens.length > 0) ? item.allergens.join(', ') : '없음';
      itemsRowsHtml += `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0;"><strong>${item.name}</strong> (${item.brand})</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">${item.spec}</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;">${item.price.toLocaleString()}원</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">${item.quantity}개</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:700;">${item.subtotal.toLocaleString()}원</td>
          <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center; font-size:12px; color:#d97706;">${allergensText}</td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <h3 style="font-size: 20px; font-weight: 800; color: var(--secondary-color); margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; display:flex; justify-content:space-between; align-items:center;">
      <span><i class="fas fa-file-invoice" style="color:var(--primary-color);"></i> 견적 접수 상세정보</span>
      <span style="font-size:14px; font-weight:700; color:var(--primary-color); background:var(--primary-light); padding:4px 12px; border-radius:12px;">${quote.status}</span>
    </h3>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background:var(--bg-main); padding: 16px; border-radius: var(--radius-md); border:1px solid var(--border-light); font-size:14px; line-height:1.7;">
      <div>
        <div><strong>접수번호:</strong> <span style="font-family:'Outfit'; font-weight:700;">${quote.receiptNo}</span></div>
        <div><strong>신청일시:</strong> ${quote.requestDate}</div>
        <div><strong>학교/기관명:</strong> ${quote.schoolName}</div>
        <div><strong>담당 교사:</strong> ${quote.teacherName}</div>
      </div>
      <div>
        <div><strong>연락처:</strong> ${quote.teacherTel}</div>
        <div><strong>이메일:</strong> ${quote.teacherEmail}</div>
        <div><strong>급식인원:</strong> ${quote.mealCount}명</div>
        <div><strong>희망납품일/주기:</strong> ${quote.deliveryStartDate || '-'} / ${quote.deliveryCycle || '-'}</div>
      </div>
      <div style="grid-column: 1 / -1; border-top:1px dashed #cbd5e1; padding-top:8px; margin-top:4px;">
        <strong>요청사항:</strong> ${quote.extraRequest || '없음'}
      </div>
    </div>

    <h4 style="font-size:15px; font-weight:700; margin-bottom:10px; color:var(--secondary-color);">신청 식자재 품목 리스트</h4>
    <div style="overflow-x:auto; margin-bottom:20px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
        <thead>
          <tr style="background:#f1f5f9; color:var(--secondary-color);">
            <th style="padding:10px; width:40px;">#</th>
            <th style="padding:10px;">품목명</th>
            <th style="padding:10px; text-align:center;">규격</th>
            <th style="padding:10px; text-align:right;">단가</th>
            <th style="padding:10px; text-align:center;">수량</th>
            <th style="padding:10px; text-align:right;">소계</th>
            <th style="padding:10px; text-align:center;">알레르기</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid var(--border-color); padding-top:16px;">
      <div style="font-size:14px; color:var(--text-muted);">총 품목 수: <strong>${quote.items ? quote.items.length : 0}개</strong></div>
      <div style="font-size:18px; font-weight:800; color:var(--secondary-color);">예상 합계: <span style="color:var(--accent-color);">${(quote.totalPrice || 0).toLocaleString()}원</span></div>
    </div>
  `;

  modal.classList.add('open');
}

function closeQuoteDetailModal() {
  const modal = document.getElementById('quoteDetailModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// -------------------------------------------------------------
// [📊 엑셀 다운로드 (승인 완료건만 추출 / CSV UTF-8 BOM 호환)]
// -------------------------------------------------------------

function exportQuotesToExcel() {
  const quotes = getQuoteRequests();
  
  // '납품 승인 완료' 상태인 접수건만 필터링
  const approvedQuotes = quotes.filter(q => q.status === '납품 승인 완료');

  if (!approvedQuotes || approvedQuotes.length === 0) {
    alert('엑셀로 다운로드할 [납품 승인 완료] 상태의 견적 신청 내역이 없습니다.\n접수 내역의 진행상태를 [납품 승인 완료]로 변경 후 다시 시도해 주세요.');
    return;
  }

  // CSV 헤더 정의
  const headers = [
    '접수번호',
    '신청일시',
    '학교/기관명',
    '담당자성명',
    '연락처',
    '이메일',
    '급식인원(명)',
    '희망납품일',
    '배송주기',
    '주문품목수',
    '주문상세품목 (제품명*수량)',
    '예상총액(원)',
    '진행상태',
    '요청사항'
  ];

  let csvRows = [];
  csvRows.push(headers.join(','));

  approvedQuotes.forEach(quote => {
    // 주문 품목을 한 문자열로 결합 (예: "국산콩 두부*4; 콩나물*5")
    const itemsDetailStr = quote.items && quote.items.length > 0
      ? quote.items.map(i => `${i.name.replace(/,/g, ' ')}*${i.quantity}`).join('; ')
      : '없음';

    const row = [
      `"${quote.receiptNo || ''}"`,
      `"${quote.requestDate || ''}"`,
      `"${(quote.schoolName || '').replace(/"/g, '""')}"`,
      `"${(quote.teacherName || '').replace(/"/g, '""')}"`,
      `"${quote.teacherTel || ''}"`,
      `"${quote.teacherEmail || ''}"`,
      `"${quote.mealCount || ''}"`,
      `"${quote.deliveryStartDate || ''}"`,
      `"${quote.deliveryCycle || ''}"`,
      `"${quote.items ? quote.items.length : 0}"`,
      `"${itemsDetailStr.replace(/"/g, '""')}"`,
      `"${quote.totalPrice || 0}"`,
      `"${quote.status || '납품 승인 완료'}"`,
      `"${(quote.extraRequest || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];

    csvRows.push(row.join(','));
  });

  // UTF-8 BOM (\uFEFF)을 추가하여 엑셀에서 한글 깨짐 방지
  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `pulmuone_approved_orders_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast(`납품 승인 완료된 총 ${approvedQuotes.length}건의 견적 내역이 엑셀(CSV)로 내려받아졌습니다.`);
  }
}


// -------------------------------------------------------------
// [기존 상품 관리 액션 & 모달 제어]
// -------------------------------------------------------------

// 19대 알레르기 체크박스 폼에 동적 렌더링
function renderFormAllergyCheckboxes(selectedAllergens = []) {
  const grid = document.getElementById('formAllergyGrid');
  if (!grid) return;

  let html = '';
  ALLERGENS.forEach(allergen => {
    const checked = selectedAllergens.includes(allergen) ? 'checked' : '';
    html += `
      <label class="allergy-checkbox-item">
        <input type="checkbox" name="formAllergens" value="${allergen}" ${checked}>
        <span>${allergen}</span>
      </label>
    `;
  });
  grid.innerHTML = html;
}

// 이미지 파일 업로드 시 Base64 문자열로 변환 (비개발자 관리용)
function handleImageFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Url = e.target.result;
    document.getElementById('formProdImageUrl').value = base64Url;
    updateImagePreview(base64Url);
  };
  reader.readAsDataURL(file);
}

// 이미지 미리보기 컴포넌트 갱신
function updateImagePreview(url) {
  const preview = document.getElementById('formImagePreview');
  if (!preview) return;

  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
  } else {
    preview.innerHTML = `<i class="fas fa-image"></i>`;
  }
}

// 제품 추가/수정 모달 열기
function openProductFormModal(productId = null) {
  document.getElementById('editProductId').value = productId || '';
  document.getElementById('productForm').reset();
  document.getElementById('formProdImageUrl').value = '';
  document.getElementById('formImageFile').value = '';
  updateImagePreview('');

  const title = document.getElementById('formModalTitle');
  const modal = document.getElementById('productFormModal');

  document.querySelectorAll('input[name="badges"]').forEach(cb => cb.checked = false);

  if (productId) {
    title.textContent = '식자재 정보 수정';
    const product = getProducts().find(p => p.id === productId);
    if (product) {
      document.getElementById('editProductId').value = product.id;
      document.getElementById('formProdName').value = product.name;
      document.getElementById('formProdBrand').value = product.brand;
      document.getElementById('formProdSpec').value = product.spec;
      document.getElementById('formProdPrice').value = product.price;
      document.getElementById('formProdOriginalPrice').value = product.originalPrice || '';
      document.getElementById('formProdCategory').value = product.category;
      document.getElementById('formProdImageUrl').value = product.image;
      updateImagePreview(product.image);
      document.getElementById('formProdDesc').value = product.description || '';

      if (product.nutrition) {
        document.getElementById('nutServing').value = product.nutrition.servingSize || '100g당';
        document.getElementById('nutCal').value = product.nutrition.calories || '';
        document.getElementById('nutCarb').value = product.nutrition.carbs || '';
        document.getElementById('nutProtein').value = product.nutrition.protein || '';
        document.getElementById('nutFat').value = product.nutrition.fat || '';
      }

      product.badges.forEach(badge => {
        const checkbox = document.querySelector(`input[name="badges"][value="${badge}"]`);
        if (checkbox) checkbox.checked = true;
      });

      renderFormAllergyCheckboxes(product.allergens);
    }
  } else {
    title.textContent = '식자재 신규 등록';
    document.getElementById('formProdOriginalPrice').value = '';
    renderFormAllergyCheckboxes([]);
  }

  modal.classList.add('open');
}

// 모달 닫기
function closeProductFormModal() {
  const modal = document.getElementById('productFormModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// 폼 서브밋 (추가/수정 저장 로직)
function handleProductFormSubmit(event) {
  event.preventDefault();

  const idVal = document.getElementById('editProductId').value;
  const name = document.getElementById('formProdName').value.trim();
  const brand = document.getElementById('formProdBrand').value;
  const spec = document.getElementById('formProdSpec').value.trim();
  const price = parseInt(document.getElementById('formProdPrice').value);
  const originalPriceVal = document.getElementById('formProdOriginalPrice').value.trim();
  const originalPrice = originalPriceVal ? parseInt(originalPriceVal) : null;
  const category = document.getElementById('formProdCategory').value;
  
  let image = document.getElementById('formProdImageUrl').value.trim();
  if (!image) {
    image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
  }

  const description = document.getElementById('formProdDesc').value.trim();
  const badgeBoxes = document.querySelectorAll('input[name="badges"]:checked');
  const badges = Array.from(badgeBoxes).map(cb => cb.value);
  const allergyBoxes = document.querySelectorAll('input[name="formAllergens"]:checked');
  const allergens = Array.from(allergyBoxes).map(cb => cb.value);

  const nutrition = {
    servingSize: document.getElementById('nutServing').value.trim() || '100g당',
    calories: document.getElementById('nutCal').value.trim() || '-',
    carbs: document.getElementById('nutCarb').value.trim() || '-',
    protein: document.getElementById('nutProtein').value.trim() || '-',
    fat: document.getElementById('nutFat').value.trim() || '-'
  };

  const currentProducts = getProducts();

  const productData = {
    name, brand, spec, price, category, image, allergens, badges, nutrition, description
  };
  if (originalPrice) {
    productData.originalPrice = originalPrice;
  }

  if (idVal) {
    const id = parseInt(idVal);
    const index = currentProducts.findIndex(p => p.id === id);
    if (index > -1) {
      currentProducts[index] = { id, ...productData };
      if (typeof showToast === 'function') {
        showToast(`'${name}' 식자재 정보가 수정되었습니다.`);
      }
    }
  } else {
    const newId = currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1;
    currentProducts.push({ id: newId, ...productData });
    if (typeof showToast === 'function') {
      showToast(`신규 식자재 '${name}'이(가) 카탈로그에 등록되었습니다.`);
    }
  }

  saveProducts(currentProducts);
  closeProductFormModal();
  renderAdminProducts();
  
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

// 식자재 삭제 액션
function handleProductDelete(productId) {
  const currentProducts = getProducts();
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;

  const isConfirmed = confirm(`'${product.name}' 식자재를 카탈로그에서 삭제하시겠습니까?\n이 작업은 즉시 반영됩니다.`);
  if (isConfirmed) {
    const updatedProducts = currentProducts.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    renderAdminProducts();
    if (typeof showToast === 'function') {
      showToast(`'${product.name}' 식자재가 삭제되었습니다.`);
    }
  }
}

// 백업 데이터 내보내기 (JSON 다운로드)
function exportProductsJSON() {
  const currentProducts = getProducts();
  const dataStr = JSON.stringify(currentProducts, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `pulmuone_meal_products_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (typeof showToast === 'function') {
    showToast('제품 백업 JSON 파일이 내보내졌습니다.');
  }
}

// 백업 데이터 가져오기 (JSON 업로드 적용)
function importProductsJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      
      if (Array.isArray(parsedData) && (parsedData.length === 0 || (parsedData[0].id && parsedData[0].name))) {
        const isConfirmed = confirm(`업로드한 파일에서 총 ${parsedData.length}개의 식자재 정보를 가져옵니다.\n기존의 상품 목록은 대체됩니다. 진행하시겠습니까?`);
        if (isConfirmed) {
          saveProducts(parsedData);
          renderAdminProducts();
          if (typeof showToast === 'function') {
            showToast('백업된 식자재 데이터를 성공적으로 복원했습니다.');
          }
        }
      } else {
        alert('올바른 풀무원 식자재 백업 JSON 파일 포맷이 아닙니다.');
      }
    } catch (err) {
      alert('JSON 파일 해석 도중 오류가 발생했습니다: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// -------------------------------------------------------------
// [탭 3] 급식 파트너 회원 관리 비즈니스 로직
// -------------------------------------------------------------

// 회원 관리 테이블 렌더링 및 통계 갱신
function renderUserTable() {
  const tableBody = document.getElementById('adminUserTableBody');
  if (!tableBody) return;

  const users = getPartnerUsers();
  const filterType = document.getElementById('userTypeFilter') ? document.getElementById('userTypeFilter').value : 'ALL';
  const searchQuery = document.getElementById('userSearchInput') ? document.getElementById('userSearchInput').value.trim().toLowerCase() : '';

  // 1. 통계 카드 갱신
  const totalCount = users.length;
  const teacherCount = users.filter(u => u.userType === '영양교사/조리사').length;
  const bizCount = users.filter(u => u.userType === '기업/기관 급식담당').length;
  const newCount = users.filter(u => u.status === '승인 대기' || u.joinDate.includes('2026-08-10')).length;

  if (document.getElementById('statTotalUsersCount')) document.getElementById('statTotalUsersCount').textContent = `${totalCount} 명`;
  if (document.getElementById('statTeacherUsersCount')) document.getElementById('statTeacherUsersCount').textContent = `${teacherCount} 명`;
  if (document.getElementById('statBizUsersCount')) document.getElementById('statBizUsersCount').textContent = `${bizCount} 명`;
  if (document.getElementById('statNewUsersCount')) document.getElementById('statNewUsersCount').textContent = `${newCount} 명`;

  updateUserBadgeCount();

  // 2. 필터 및 검색 적용
  let filteredUsers = users.filter(u => {
    const matchType = (filterType === 'ALL' || u.userType === filterType);
    const matchSearch = !searchQuery || 
      (u.schoolName && u.schoolName.toLowerCase().includes(searchQuery)) ||
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.email && u.email.toLowerCase().includes(searchQuery));
    return matchType && matchSearch;
  });

  if (filteredUsers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-users-slash" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
          조건에 부합하는 급식 파트너 회원이 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  // 3. 테이블 HTML 생성
  tableBody.innerHTML = filteredUsers.map((user, index) => {
    // 가입 수단별 배지 디자인
    let providerBadge = `<span class="badge-custom" style="background:#e2e8f0; color:#334155;">일반 가입</span>`;
    if (user.authProvider.includes('카카오')) {
      providerBadge = `<span class="badge-custom" style="background:#FEE500; color:#000; font-weight:700;"><i class="fas fa-comment"></i> 카카오</span>`;
    } else if (user.authProvider.includes('네이버')) {
      providerBadge = `<span class="badge-custom" style="background:#03C75A; color:#fff; font-weight:700;"><i class="fas fa-bold"></i> 네이버</span>`;
    } else if (user.authProvider.includes('SSO') || user.authProvider.includes('교육청')) {
      providerBadge = `<span class="badge-custom" style="background:#0f172a; color:#fff; font-weight:700;"><i class="fas fa-university"></i> 교육청 SSO</span>`;
    }

    // 회원 상태 색상
    const isApproved = user.status === '승인 완료';
    const statusSelectClass = isApproved ? 'status-blue' : 'status-orange';

    return `
      <tr>
        <td style="font-size: 12px; color: var(--text-muted);">${user.joinDate}</td>
        <td><strong style="color: var(--secondary-color); font-size: 13px;">${user.userType}</strong></td>
        <td><strong style="color: var(--primary-color);">${user.schoolName}</strong></td>
        <td>${user.name}</td>
        <td style="font-size: 13px; color: #2563eb;">${user.email}</td>
        <td style="font-size: 13px;">${user.tel || '010-0000-0000'}</td>
        <td>${providerBadge}</td>
        <td>
          <select class="status-select ${statusSelectClass}" onchange="handleUserStatusChange(${index}, this.value)">
            <option value="승인 대기" ${!isApproved ? 'selected' : ''}>승인 대기</option>
            <option value="승인 완료" ${isApproved ? 'selected' : ''}>승인 완료</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:4px; justify-content:center;">
            <button class="btn-admin-action secondary" onclick="openUserDetailModal(${index})" style="padding: 4px 8px; font-size: 12px;" title="상세보기">
              <i class="fas fa-search"></i>
            </button>
            <button class="btn-admin-action secondary" onclick="deletePartnerUser(${index})" style="padding: 4px 8px; font-size: 12px; color:#dc2626;" title="회원 삭제">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 회원 승인 상태 변경
function handleUserStatusChange(index, newStatus) {
  const users = getPartnerUsers();
  if (users[index]) {
    users[index].status = newStatus;
    savePartnerUsers(users);
    renderUserTable();
    if (typeof showToast === 'function') {
      showToast(`'${users[index].name}' 파트너 회원 상태가 [${newStatus}]로 변경되었습니다.`);
    }
  }
}

// 회원 상세 정보 모달 열기
function openUserDetailModal(index) {
  const users = getPartnerUsers();
  const user = users[index];
  if (!user) return;

  const modal = document.getElementById('adminUserDetailModal');
  const body = document.getElementById('adminUserDetailBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
      <h3 style="font-size: 20px; font-weight: 800; color: var(--secondary-color);">
        <i class="fas fa-id-card" style="color: var(--primary-color);"></i> 파트너 회원 상세 프로필
      </h3>
      <span class="badge-custom" style="background: var(--primary-light); color: var(--primary-color); font-weight: 700; margin-top: 6px; display: inline-block;">
        ${user.userType}
      </span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 14px; margin-bottom: 24px;">
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">소속 기관/학교명</span>
        <strong style="font-size:15px; color:#0f172a;">${user.schoolName}</strong>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">담당자 성명</span>
        <strong style="font-size:15px; color:#0f172a;">${user.name}</strong>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">이메일 (아이디)</span>
        <strong style="font-size:14px; color:#2563eb;">${user.email}</strong>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">연락처</span>
        <strong style="font-size:14px; color:#0f172a;">${user.tel || '010-0000-0000'}</strong>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">가입 수단</span>
        <strong style="font-size:14px; color:#0f172a;">${user.authProvider}</strong>
      </div>
      <div style="background:#f8fafc; padding:12px; border-radius:6px;">
        <span style="font-size:12px; color:#64748b; display:block;">가입 일시</span>
        <strong style="font-size:14px; color:#0f172a;">${user.joinDate}</strong>
      </div>
    </div>

    <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:14px; border-radius:6px; font-size:13px; color:#1e40af; margin-bottom:20px;">
      <i class="fas fa-info-circle"></i> 본 파트너 회원은 풀무원 학교급식 단가 견적서 발급 및 전자세금계산서 연동 권한을 부여받은 회원입니다.
    </div>

    <div style="text-align: right; display:flex; justify-content:flex-end; gap:8px;">
      <button class="btn-admin-action secondary" onclick="closeUserDetailModal()">닫기</button>
    </div>
  `;

  modal.classList.add('open');
}

function closeUserDetailModal() {
  const modal = document.getElementById('adminUserDetailModal');
  if (modal) modal.classList.remove('open');
}

// 회원 삭제
function deletePartnerUser(index) {
  const users = getPartnerUsers();
  const user = users[index];
  if (!user) return;

  if (confirm(`'${user.schoolName} ${user.name}' 회원을 정말 삭제하시겠습니까?`)) {
    users.splice(index, 1);
    savePartnerUsers(users);
    renderUserTable();
    if (typeof showToast === 'function') {
      showToast(`'${user.name}' 회원이 삭제되었습니다.`);
    }
  }
}

// 회원 목록 엑셀(CSV) 다운로드
function exportUsersToExcel() {
  const users = getPartnerUsers();

  if (users.length === 0) {
    alert('내려받을 파트너 회원 데이터가 없습니다.');
    return;
  }

  // UTF-8 BOM
  let csvContent = '\uFEFF';
  csvContent += '가입일시,회원구분,소속기관/학교명,담당자성명,이메일아이디,연락처,가입수단,회원상태\n';

  users.forEach(u => {
    const row = [
      `"${u.joinDate}"`,
      `"${u.userType}"`,
      `"${u.schoolName}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.tel || ''}"`,
      `"${u.authProvider}"`,
      `"${u.status}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pulmuone_partner_users_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('급식 파트너 회원 목록이 엑셀(CSV)로 다운로드되었습니다.');
  }
}

