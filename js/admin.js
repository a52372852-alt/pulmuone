// 어드민 대시보드 비즈니스 로직 및 CRUD 제어

const ADMIN_SESSION_KEY = 'pulmuone_admin_session';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  bindAdminEvents();
});

// 관리자 로그인 상태 확인
function checkAdminAuth() {
  const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');

  if (!loginSection || !dashboardSection) return;

  if (isLogged) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    renderAdminProducts();
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

// 대시보드 리스트 테이블 렌더링
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
  // 초기화 및 복원
  document.getElementById('editProductId').value = productId || '';
  document.getElementById('productForm').reset();
  document.getElementById('formProdImageUrl').value = '';
  document.getElementById('formImageFile').value = '';
  updateImagePreview('');

  const title = document.getElementById('formModalTitle');
  const modal = document.getElementById('productFormModal');

  // 체크박스들 강제 해제 초기화
  document.querySelectorAll('input[name="badges"]').forEach(cb => cb.checked = false);

  if (productId) {
    // 수정 모드
    title.textContent = '식자재 정보 수정';
    const product = getProducts().find(p => p.id === productId);
    if (product) {
      document.getElementById('editProductId').value = product.id;
      document.getElementById('formProdName').value = product.name;
      document.getElementById('formProdBrand').value = product.brand;
      document.getElementById('formProdSpec').value = product.spec;
      document.getElementById('formProdPrice').value = product.price;
      
      // 정상 가격 바인딩
      document.getElementById('formProdOriginalPrice').value = product.originalPrice || '';
      
      document.getElementById('formProdCategory').value = product.category;
      document.getElementById('formProdImageUrl').value = product.image;
      updateImagePreview(product.image);
      document.getElementById('formProdDesc').value = product.description || '';

      // 영양정보 세팅
      if (product.nutrition) {
        document.getElementById('nutServing').value = product.nutrition.servingSize || '100g당';
        document.getElementById('nutCal').value = product.nutrition.calories || '';
        document.getElementById('nutCarb').value = product.nutrition.carbs || '';
        document.getElementById('nutProtein').value = product.nutrition.protein || '';
        document.getElementById('nutFat').value = product.nutrition.fat || '';
      }

      // 가치배지 설정
      product.badges.forEach(badge => {
        const checkbox = document.querySelector(`input[name="badges"][value="${badge}"]`);
        if (checkbox) checkbox.checked = true;
      });

      // 알레르기 설정
      renderFormAllergyCheckboxes(product.allergens);
    }
  } else {
    // 신규 등록 모드
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
  
  // 정상가 파싱
  const originalPriceVal = document.getElementById('formProdOriginalPrice').value.trim();
  const originalPrice = originalPriceVal ? parseInt(originalPriceVal) : null;
  
  const category = document.getElementById('formProdCategory').value;
  
  // 이미지 처리
  let image = document.getElementById('formProdImageUrl').value.trim();
  if (!image) {
    image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
  }

  const description = document.getElementById('formProdDesc').value.trim();

  // 체크박스 수집 (가치 배지)
  const badgeBoxes = document.querySelectorAll('input[name="badges"]:checked');
  const badges = Array.from(badgeBoxes).map(cb => cb.value);

  // 알레르기 수집
  const allergyBoxes = document.querySelectorAll('input[name="formAllergens"]:checked');
  const allergens = Array.from(allergyBoxes).map(cb => cb.value);

  // 영양 성분 수집
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
    // 수정 저장
    const id = parseInt(idVal);
    const index = currentProducts.findIndex(p => p.id === id);
    if (index > -1) {
      currentProducts[index] = { id, ...productData };
      if (typeof showToast === 'function') {
        showToast(`'${name}' 식자재 정보가 수정되었습니다.`);
      }
    }
  } else {
    // 신규 추가 저장 (가장 큰 ID + 1로 신규 ID 생성)
    const newId = currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1;
    currentProducts.push({ id: newId, ...productData });
    if (typeof showToast === 'function') {
      showToast(`신규 식자재 '${name}'이(가) 카탈로그에 등록되었습니다.`);
    }
  }

  saveProducts(currentProducts);
  closeProductFormModal();
  renderAdminProducts();
  
  // 헤더 배지 카운트도 최신화
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

// 백업 데이터 내보내기 (JSON 다운로드) - 비개발자 데이터 추출용
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
      
      // 초간단 데이터 검증
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
  event.target.value = ''; // 초기화
}
