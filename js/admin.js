// 어드민 대시보드 비즈니스 로직 및 CRUD 제어

const ADMIN_SESSION_KEY = 'pulmuone_admin_session';
const QUOTE_STORAGE_KEY = 'pulmuone_quote_requests';

// 초기 샘플 견적 접수 데이터 주입
const DEMO_QUOTE_REQUESTS = [
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

// 탭 전환 제어
function switchAdminTab(tabName) {
  const btnProducts = document.getElementById('tabBtnProducts');
  const btnQuotes = document.getElementById('tabBtnQuotes');
  const contentProducts = document.getElementById('tabContentProducts');
  const contentQuotes = document.getElementById('tabContentQuotes');

  if (!btnProducts || !btnQuotes || !contentProducts || !contentQuotes) return;

  if (tabName === 'products') {
    btnProducts.classList.add('active');
    btnQuotes.classList.remove('active');
    contentProducts.style.display = 'block';
    contentQuotes.style.display = 'none';
    renderAdminProducts();
  } else if (tabName === 'quotes') {
    btnProducts.classList.remove('active');
    btnQuotes.classList.add('active');
    contentProducts.style.display = 'none';
    contentQuotes.style.display = 'block';
    renderAdminQuotes();
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

  // 통계 계산
  const totalCount = allQuotes.length;
  const pendingCount = allQuotes.filter(q => q.status === '매칭 중' || q.status === '견적 검토 중').length;
  const completedCount = allQuotes.filter(q => q.status === '납품 승인 완료' || q.status === '상세 상담 완료').length;
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

    // 진행 상태별 드롭다운 옵션 렌더링
    const statuses = ['매칭 중', '견적 검토 중', '납품 승인 완료', '상세 상담 완료'];
    let statusOptionsHtml = '';
    statuses.forEach(s => {
      const selected = (quote.status === s) ? 'selected' : '';
      statusOptionsHtml += `<option value="${s}" ${selected}>${s}</option>`;
    });

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
          <select class="status-select" onchange="handleQuoteStatusChange('${quote.receiptNo}', this.value)">
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
// [📊 엑셀 다운로드 (CSV UTF-8 BOM 호환) 비즈니스 로직]
// -------------------------------------------------------------

function exportQuotesToExcel() {
  const quotes = getQuoteRequests();
  if (!quotes || quotes.length === 0) {
    alert('다운로드할 견적 접수 내역이 없습니다.');
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

  quotes.forEach(quote => {
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
      `"${quote.status || '매칭 중'}"`,
      `"${(quote.extraRequest || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];

    csvRows.push(row.join(','));
  });

  // UTF-8 BOM (\uFEFF)을 추가해야 엑셀에서 한글 깨짐 없이 열립니다.
  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `pulmuone_b2b_quote_orders_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('B2B 견적/주문 내역이 엑셀(CSV) 파일로 다운로드되었습니다.');
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

