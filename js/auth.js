// 풀무원 바른급식 파트너 - 로그인 / 회원가입 / 고객센터 통합 모듈

const USER_SESSION_KEY = 'pulmuone_user_session';

document.addEventListener('DOMContentLoaded', () => {
  initAuthModals();
  updateAuthHeaderUI();
});

// -------------------------------------------------------------
// 1. 모달 HTML 동적 주입 및 초기화
// -------------------------------------------------------------
function initAuthModals() {
  if (document.getElementById('userLoginModal')) return; // 이미 등록됨

  const modalsHtml = `
    <!-- 로그인 모달 -->
    <div class="modal-overlay" id="userLoginModal">
      <div class="modal-window animate-fade-in" style="max-width: 440px;">
        <button class="modal-close" onclick="closeLoginModal()"><i class="fas fa-times"></i></button>
        <div class="modal-body" style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <i class="fas fa-leaf" style="font-size: 32px; color: var(--primary-color); margin-bottom: 8px;"></i>
            <h3 style="font-size: 22px; font-weight: 800; color: var(--secondary-color);">급식 파트너 로그인</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">풀무원 바른급식 B2B 맞춤 서비스를 이용해 보세요.</p>
          </div>

          <button class="demo-fill-btn" onclick="fillDemoUser()">
            <i class="fas fa-bolt"></i> <strong>안심초 김영양 교사</strong> 데모 계정 자동 입력
          </button>

          <form id="userLoginForm" onsubmit="handleUserLogin(event)">
            <div class="form-control-group">
              <label class="form-label">아이디 (이메일)</label>
              <input type="email" class="input-field" id="loginEmail" placeholder="teacher@school.es.kr" required>
            </div>
            <div class="form-control-group">
              <label class="form-label">비밀번호</label>
              <input type="password" class="input-field" id="loginPassword" placeholder="비밀번호 입력" required>
            </div>
            <button type="submit" class="btn-submit-quote-page" style="padding: 12px; font-size: 15px; margin-top: 10px;">로그인</button>
          </form>

          <div class="social-login-group">
            <button class="btn-social-login sso" onclick="handleSocialLogin('교육청 SSO')">
              <i class="fas fa-university"></i> 전국 교육청 SSO 간편 로그인
            </button>
            <div style="display:flex; gap:8px;">
              <button class="btn-social-login kakao" onclick="handleSocialLogin('카카오')">
                <i class="fas fa-comment"></i> 카카오
              </button>
              <button class="btn-social-login naver" onclick="handleSocialLogin('네이버')">
                <i class="fas fa-bold"></i> 네이버
              </button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted);">
            아직 급식 파트너 회원이 아니신가요? 
            <a href="#" onclick="switchModalToSignup(event)" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">회원가입</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원가입 모달 -->
    <div class="modal-overlay" id="userSignupModal">
      <div class="modal-window animate-fade-in" style="max-width: 520px;">
        <button class="modal-close" onclick="closeSignupModal()"><i class="fas fa-times"></i></button>
        <div class="modal-body" style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 22px; font-weight: 800; color: var(--secondary-color);">급식 파트너 회원가입</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">학교 및 기관 급식 전용 혜택과 단가 견적을 받아보세요.</p>
          </div>

          <button class="demo-fill-btn" onclick="fillDemoSignupUser()" type="button">
            <i class="fas fa-bolt"></i> <strong>서울초 홍길동 영양교사</strong> 가입정보 자동 채우기
          </button>

          <form id="userSignupForm" onsubmit="handleUserSignup(event)">
            <div class="form-control-group">
              <label class="form-label">회원 구분 <span class="required">*</span></label>
              <select class="select-field" id="signupUserType" required>
                <option value="영양교사/조리사">학교 영양교사 / 조리사</option>
                <option value="기업/기관 급식담당">기업 / 공공기관 급식 담당자</option>
                <option value="유치원/어린이집">유치원 / 어린이집 원장·교사</option>
                <option value="일반 B2B">일반 식자재 구매 회원</option>
              </select>
            </div>

            <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-control-group">
                <label class="form-label">소속 기관/학교명 <span class="required">*</span></label>
                <input type="text" class="input-field" id="signupSchoolName" placeholder="예: 서울초등학교" required>
              </div>
              <div class="form-control-group">
                <label class="form-label">담당자 성명 <span class="required">*</span></label>
                <input type="text" class="input-field" id="signupName" placeholder="예: 홍길동" required>
              </div>
            </div>

            <div class="form-control-group">
              <label class="form-label">이메일 (아이디) <span class="required">*</span></label>
              <input type="email" class="input-field" id="signupEmail" placeholder="teacher@school.es.kr" required>
            </div>

            <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-control-group">
                <label class="form-label">연락처 <span class="required">*</span></label>
                <input type="tel" class="input-field" id="signupTel" placeholder="010-0000-0000" required>
              </div>
              <div class="form-control-group">
                <label class="form-label">비밀번호 <span class="required">*</span></label>
                <input type="password" class="input-field" id="signupPassword" placeholder="6자리 이상" minlength="6" required>
              </div>
            </div>

            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" id="signupAgreeCheck" required checked> [필수] 이용약관 및 개인정보 처리방침 동의
              </label>
            </div>

            <button type="submit" class="btn-submit-quote-page" style="padding: 12px; font-size: 15px; width: 100%; cursor: pointer;">회원가입 완료</button>
          </form>

          <div style="position:relative; text-align:center; margin: 20px 0 16px 0;">
            <hr style="border:none; border-top:1px solid var(--border-color);">
            <span style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#fff; padding:0 10px; font-size:12px; color:var(--text-muted);">또는 간편 회원가입</span>
          </div>

          <div class="social-login-group">
            <button class="btn-social-login sso" onclick="handleSocialSignup('전국 교육청 SSO')">
              <i class="fas fa-university"></i> 전국 교육청 SSO 간편 회원가입
            </button>
            <div style="display:flex; gap:8px;">
              <button class="btn-social-login kakao" onclick="handleSocialSignup('카카오')">
                <i class="fas fa-comment"></i> 카카오 가입
              </button>
              <button class="btn-social-login naver" onclick="handleSocialSignup('네이버')">
                <i class="fas fa-bold"></i> 네이버 가입
              </button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-muted);">
            이미 계정이 있으신가요? 
            <a href="#" onclick="switchModalToLogin(event)" style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">로그인하기</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 소셜 / 교육청 SSO 전용 인증 모달 -->
    <div class="modal-overlay" id="socialAuthModal">
      <div class="modal-window animate-fade-in" style="max-width: 460px; overflow: hidden;">
        <button class="modal-close" onclick="closeSocialAuthModal()" style="z-index:10; color:#888;"><i class="fas fa-times"></i></button>
        
        <div id="socialModalHeader" class="social-modal-header kakao">
          <!-- 동적 주입 -->
        </div>

        <div class="modal-body" style="padding: 0 24px 24px 24px;">
          <form id="socialAuthForm" onsubmit="handleSocialAuthSubmit(event)">
            <input type="hidden" id="socialProvider">
            
            <div id="socialFormFields">
              <!-- 동적 입력 필드 주입 -->
            </div>

            <div class="social-consent-box">
              <label>
                <input type="checkbox" required checked> [필수] 개인정보 및 프로필 제3자 제공 동의
              </label>
              <label>
                <input type="checkbox" required checked> [필수] 풀무원 바른급식 파트너 계정 연동 동의
              </label>
              <div style="font-size:11px; color:#64748b; margin-top:4px;">* 입력하신 계정 정보는 안전하게 암호화되어 급식 단가 및 견적 서비스 이용 목적으로만 사용됩니다.</div>
            </div>

            <button type="submit" id="socialAuthSubmitBtn" class="btn-submit-quote-page" style="padding: 12px; font-size: 15px; width: 100%;">
              인증 동의 및 로그인 완료
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 고객센터 모달 -->
    <div class="modal-overlay" id="userCsModal">
      <div class="modal-window animate-fade-in" style="max-width: 680px;">
        <button class="modal-close" onclick="closeCsModal()"><i class="fas fa-times"></i></button>
        <div class="modal-body" style="padding: 30px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px;">
            <h3 style="font-size: 20px; font-weight: 800; color: var(--secondary-color); display:flex; align-items:center; gap:8px;">
              <i class="fas fa-headset" style="color:var(--primary-color);"></i> 풀무원 바른급식 고객센터
            </h3>
            <span style="font-size:13px; color:var(--text-muted);"><i class="fas fa-phone-alt" style="color:var(--primary-color);"></i> 1600-8800</span>
          </div>

          <!-- 고객센터 탭 -->
          <div class="cs-tab-nav">
            <button class="cs-tab-btn active" id="csTabBtn1" onclick="switchCsTab(1)">1:1 급식 상담 문의</button>
            <button class="cs-tab-btn" id="csTabBtn2" onclick="switchCsTab(2)">자주 묻는 질문 (FAQ)</button>
            <button class="cs-tab-btn" id="csTabBtn3" onclick="switchCsTab(3)">운영시간 & 오시는길</button>
          </div>

          <!-- 탭 1: 1:1 상담 문의 -->
          <div id="csTabContent1">
            <form id="csInquiryForm" onsubmit="handleCsSubmit(event)">
              <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-control-group">
                  <label class="form-label">문의 유형 <span class="required">*</span></label>
                  <select class="select-field" id="csCategory" required>
                    <option value="단가/견적 문의">급식 단가 / 견적 문의</option>
                    <option value="위생/품질 보증서">19대 알레르기 및 위생 보증서 문의</option>
                    <option value="배송/지정일 변경">배송 일정 및 주간 배송 변경</option>
                    <option value="식자재 샘플 신청">식자재 무료 샘플 신청</option>
                    <option value="기타 문의">기타 B2B 문의</option>
                  </select>
                </div>
                <div class="form-control-group">
                  <label class="form-label">신청자/학교명 <span class="required">*</span></label>
                  <input type="text" class="input-field" id="csName" placeholder="예: 안심초 김영양 교사" required>
                </div>
              </div>

              <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-control-group">
                  <label class="form-label">연락처 <span class="required">*</span></label>
                  <input type="tel" class="input-field" id="csTel" placeholder="010-0000-0000" required>
                </div>
                <div class="form-control-group">
                  <label class="form-label">답변받을 이메일 <span class="required">*</span></label>
                  <input type="email" class="input-field" id="csEmail" placeholder="teacher@school.es.kr" required>
                </div>
              </div>

              <div class="form-control-group">
                <label class="form-label">문의 내용 <span class="required">*</span></label>
                <textarea class="textarea-field" id="csContent" style="height: 100px;" placeholder="문의하실 급식 관련 내용을 상세히 작성해 주시면 담당 매니저가 신속히 안내드립니다." required></textarea>
              </div>

              <button type="submit" class="btn-submit-quote-page" style="padding: 12px; font-size: 14px;">1:1 문의 제출하기</button>
            </form>
          </div>

          <!-- 탭 2: FAQ -->
          <div id="csTabContent2" style="display: none;">
            <div class="faq-list">
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  <span><i class="fas fa-question-circle" style="color:var(--primary-color); margin-right:8px;"></i> [학교급식] 납품 세금계산서 및 서류는 어떻게 발급받나요?</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  학교 행정실 및 영양교사 전용 B2B 시스템을 통해 전자세금계산서가 지정일에 자동 발급됩니다. 필요시 [견적서 접수 내역] 또는 대표 상담센터(1600-8800)로 신청하시면 원본 서류(영양성분표, 친환경 인증서, 축산물 등급판정서 등)를 이메일로 1분 내 발급해 드립니다.
                </div>
              </div>

              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  <span><i class="fas fa-question-circle" style="color:var(--primary-color); margin-right:8px;"></i> [알레르기] 19대 의무 표시 알레르기 성분 확인서가 제공되나요?</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  네! 풀무원 바른급식의 모든 식자재는 식품의약품안전처 기준 19대 알레르기 유발 물질 포함 여부가 100% 전수 검사되어 제공되며, 견적 신청 시 알레르기 안심 검토 리포트가 자동으로 생성됩니다.
                </div>
              </div>

              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  <span><i class="fas fa-question-circle" style="color:var(--primary-color); margin-right:8px;"></i> [배송] 방학 기간 또는 특정 지정일 배송 일시 정지가 가능한가요?</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  학교 방학 및 행사 일정에 맞추어 주간 배송 일정을 자율적으로 조정하실 수 있습니다. 희망배송일 최소 3일 전 1:1 문의 또는 전담 대리점 매니저에게 요청해 주시면 정산 처리됩니다.
                </div>
              </div>

              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  <span><i class="fas fa-question-circle" style="color:var(--primary-color); margin-right:8px;"></i> [지구식단] 식물성/친환경 제품 무료 샘플 신청 절차는 어떻게 되나요?</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                  상단 '1:1 급식 상담 문의'에서 문의 유형을 '식자재 샘플 신청'으로 선택하신 후 학교명과 연락처를 남겨주시면 지역 담당 매니저가 무료 시식 샘플 키트를 직접 배송해 드립니다.
                </div>
              </div>
            </div>
          </div>

          <!-- 탭 3: 운영시간 안내 -->
          <div id="csTabContent3" style="display: none;">
            <div style="background-color: var(--bg-main); padding: 20px; border-radius: var(--radius-md); border:1px solid var(--border-light); font-size: 14px; line-height: 1.8;">
              <h4 style="font-weight:800; color:var(--secondary-color); margin-bottom:12px; font-size:16px;">
                <i class="fas fa-clock" style="color:var(--primary-color);"></i> 고객만족센터 운영 안내
              </h4>
              <p><strong>대표 전화:</strong> <span style="font-family:'Outfit'; font-weight:700; color:var(--primary-color); font-size:16px;">1600-8800</span></p>
              <p><strong>운영 시간:</strong> 평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</p>
              <p><strong>휴무일:</strong> 토요일 / 일요일 / 법정 공휴일 (긴급 위생/품질 문의는 24시간 당직 연결 가능)</p>
              <hr style="border:none; border-top:1px dashed var(--border-color); margin:14px 0;">
              <p><strong>본사 주소:</strong> 충남 홍성군 홍성읍 백월로 59 풀무원 바른급식 파트너 센터</p>
              <p><strong>이메일 문의:</strong> b2b_support@pulmuonemeal.co.kr</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalsHtml;
  document.body.appendChild(container);

  // 모달 오버레이 바깥쪽 클릭 시 닫기
  ['userLoginModal', 'userSignupModal', 'socialAuthModal', 'userCsModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }
  });
}

// -------------------------------------------------------------
// 2. 로그인 세션 및 헤더 UI 업데이트
// -------------------------------------------------------------
function getCurrentUser() {
  const userStr = localStorage.getItem(USER_SESSION_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function updateAuthHeaderUI() {
  const user = getCurrentUser();
  
  const topNav = document.querySelector('.top-nav');
  const mobileUserUtility = document.querySelector('.mobile-user-utility');

  if (user) {
    const profileHtml = `
      <span class="user-profile-chip"><i class="fas fa-user-check"></i> ${user.name} (${user.schoolName || '파트너'})</span>
      <a href="#" onclick="handleUserLogout(event)" class="user-logout-btn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>
      <a href="#" onclick="openCsModal(event)"><i class="fas fa-headset"></i> 고객센터</a>
      <a href="admin.html" title="관리자 콘솔"><i class="fas fa-cog"></i> 관리자</a>
    `;
    if (topNav) topNav.innerHTML = profileHtml;
    
    if (mobileUserUtility) {
      mobileUserUtility.innerHTML = `
        <span class="user-profile-chip"><i class="fas fa-user-check"></i> ${user.name}</span>
        <a href="#" onclick="handleUserLogout(event)"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>
        <a href="#" onclick="openCsModal(event)"><i class="fas fa-headset"></i> 고객센터</a>
        <a href="admin.html"><i class="fas fa-cog"></i> 관리자</a>
      `;
    }
  } else {
    const defaultNavHtml = `
      <a href="#" onclick="openLoginModal(event)"><i class="fas fa-sign-in-alt"></i> 로그인</a>
      <a href="#" onclick="openSignupModal(event)"><i class="fas fa-user-plus"></i> 회원가입</a>
      <a href="#" onclick="openCsModal(event)"><i class="fas fa-headset"></i> 고객센터</a>
      <a href="admin.html" title="관리자 콘솔"><i class="fas fa-cog"></i> 관리자</a>
    `;
    if (topNav) topNav.innerHTML = defaultNavHtml;

    if (mobileUserUtility) {
      mobileUserUtility.innerHTML = `
        <a href="#" onclick="openLoginModal(event)"><i class="fas fa-user"></i> 로그인</a>
        <a href="#" onclick="openSignupModal(event)"><i class="fas fa-user-plus"></i> 회원가입</a>
        <a href="#" onclick="openCsModal(event)"><i class="fas fa-headset"></i> 고객센터</a>
        <a href="admin.html"><i class="fas fa-cog"></i> 관리자</a>
      `;
    }
  }
}

// -------------------------------------------------------------
// 3. 로그인 모달 제어
// -------------------------------------------------------------
function openLoginModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('userLoginModal');
  if (modal) modal.classList.add('open');
}

function closeLoginModal() {
  const modal = document.getElementById('userLoginModal');
  if (modal) modal.classList.remove('open');
}

function fillDemoUser() {
  document.getElementById('loginEmail').value = 'teacher@ansim.es.kr';
  document.getElementById('loginPassword').value = '123456';
  if (typeof showToast === 'function') {
    showToast('안심초 김영양 영양교사 데모 계정이 입력되었습니다.');
  }
}

function fillDemoSignupUser() {
  if (document.getElementById('signupSchoolName')) document.getElementById('signupSchoolName').value = '서울초등학교';
  if (document.getElementById('signupName')) document.getElementById('signupName').value = '홍길동';
  if (document.getElementById('signupEmail')) document.getElementById('signupEmail').value = 'hong@seoul.es.kr';
  if (document.getElementById('signupTel')) document.getElementById('signupTel').value = '010-9876-5432';
  if (document.getElementById('signupPassword')) document.getElementById('signupPassword').value = '123456';
  if (typeof showToast === 'function') {
    showToast('서울초 홍길동 영양교사 가입 정보가 채워졌습니다.');
  }
}

function handleUserLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  
  const userData = {
    email: email,
    name: email.includes('ansim') ? '김영양 교사' : '급식담당자',
    schoolName: email.includes('ansim') ? '안심초등학교' : '바른급식 파트너',
    userType: '영양교사/조리사',
    loginDate: new Date().toLocaleString()
  };

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
  closeLoginModal();
  updateAuthHeaderUI();
  
  if (typeof showToast === 'function') {
    showToast(`'${userData.name}'님 환영합니다! 바른급식 파트너 세션이 시작되었습니다.`);
  }
}

function handleUserLogout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem(USER_SESSION_KEY);
  updateAuthHeaderUI();
  if (typeof showToast === 'function') {
    showToast('성공적으로 로그아웃되었습니다.');
  }
}

function openSignupModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('userSignupModal');
  if (modal) modal.classList.add('open');
}

function closeSignupModal() {
  const modal = document.getElementById('userSignupModal');
  if (modal) modal.classList.remove('open');
}

function handleUserSignup(e) {
  if (e) e.preventDefault();
  
  const userTypeEl = document.getElementById('signupUserType');
  const schoolNameEl = document.getElementById('signupSchoolName');
  const nameEl = document.getElementById('signupName');
  const emailEl = document.getElementById('signupEmail');

  const userType = userTypeEl ? userTypeEl.value : '영양교사/조리사';
  const schoolName = (schoolNameEl && schoolNameEl.value.trim()) ? schoolNameEl.value.trim() : '서울초등학교';
  const name = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : '홍길동 교사';
  const email = (emailEl && emailEl.value.trim()) ? emailEl.value.trim() : 'hong@seoul.es.kr';

  const userData = {
    email: email,
    name: name,
    schoolName: schoolName,
    userType: userType,
    loginDate: new Date().toLocaleString()
  };

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
  saveUserToAdminList(userData, '일반 회원가입');

  closeSignupModal();
  updateAuthHeaderUI();

  alert(`🎉 회원가입 완료!\n\n${schoolName} ${name}님, 풀무원 바른급식 파트너 회원가입 및 자동 로그인이 정상 완료되었습니다.`);
  if (typeof showToast === 'function') {
    showToast(`'${name}'님 회원가입 및 로그인이 완료되었습니다.`);
  }
}

function handleSocialLogin(provider) {
  closeLoginModal();
  openSocialAuthModal(provider);
}

function handleSocialSignup(provider) {
  closeSignupModal();
  openSocialAuthModal(provider);
}

// -------------------------------------------------------------
// [소셜 / 교육청 SSO 전용 인증 모달 팝업 제어]
// -------------------------------------------------------------
function openSocialAuthModal(provider) {
  const modal = document.getElementById('socialAuthModal');
  const header = document.getElementById('socialModalHeader');
  const fields = document.getElementById('socialFormFields');
  const providerInput = document.getElementById('socialProvider');
  const submitBtn = document.getElementById('socialAuthSubmitBtn');

  if (!modal || !header || !fields) return;

  providerInput.value = provider;

  if (provider.includes('카카오')) {
    header.className = 'social-modal-header kakao';
    header.innerHTML = `
      <i class="fas fa-comment" style="font-size:36px; margin-bottom:8px;"></i>
      <h4 style="font-size:20px; font-weight:800; margin:0;">카카오 계정 간편 가입 / 로그인</h4>
      <p style="font-size:12px; margin-top:4px; opacity:0.85;">카카오 계정 프로필로 빠르게 급식 파트너 서비스를 이용하세요.</p>
    `;
    fields.innerHTML = `
      <div class="form-control-group">
        <label class="form-label">카카오 계정 (이메일 아이디) <span class="required">*</span></label>
        <input type="email" class="input-field" id="socialEmail" placeholder="example@kakao.com" value="teacher_kakao@kakao.com" required>
      </div>
      <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div class="form-control-group">
          <label class="form-label">카카오 닉네임 / 성명 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialName" placeholder="예: 김영양" value="김영양 (카카오)" required>
        </div>
        <div class="form-control-group">
          <label class="form-label">소속 기관/학교명 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialSchool" placeholder="예: 안심초등학교" value="안심초등학교" required>
        </div>
      </div>
    `;
    submitBtn.style.backgroundColor = '#FEE500';
    submitBtn.style.color = '#000000';
    submitBtn.style.borderColor = '#FEE500';
    submitBtn.textContent = '카카오 계정으로 가입/로그인 완료';
  } else if (provider.includes('네이버')) {
    header.className = 'social-modal-header naver';
    header.innerHTML = `
      <i class="fas fa-bold" style="font-size:36px; margin-bottom:8px;"></i>
      <h4 style="font-size:20px; font-weight:800; margin:0;">네이버 아이디 간편 가입 / 로그인</h4>
      <p style="font-size:12px; margin-top:4px; opacity:0.9;">네이버 아이디 인증으로 안전하게 서비스를 연동합니다.</p>
    `;
    fields.innerHTML = `
      <div class="form-control-group">
        <label class="form-label">네이버 아이디 (이메일) <span class="required">*</span></label>
        <input type="email" class="input-field" id="socialEmail" placeholder="id@naver.com" value="teacher_naver@naver.com" required>
      </div>
      <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div class="form-control-group">
          <label class="form-label">이름 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialName" placeholder="예: 박급식" value="박급식 (네이버)" required>
        </div>
        <div class="form-control-group">
          <label class="form-label">소속 기관/학교명 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialSchool" placeholder="예: 서울중학교" value="서울중학교" required>
        </div>
      </div>
    `;
    submitBtn.style.backgroundColor = '#03C75A';
    submitBtn.style.color = '#ffffff';
    submitBtn.style.borderColor = '#03C75A';
    submitBtn.textContent = '네이버 아이디로 가입/로그인 완료';
  } else {
    // 전국 교육청 SSO
    header.className = 'social-modal-header sso';
    header.innerHTML = `
      <i class="fas fa-university" style="font-size:36px; margin-bottom:8px; color:var(--primary-color);"></i>
      <h4 style="font-size:20px; font-weight:800; margin:0;">전국 교육청 통합 SSO 인증</h4>
      <p style="font-size:12px; margin-top:4px; opacity:0.85;">시·도 교육청 교직원 통합 인증으로 급식 서비스를 이용하세요.</p>
    `;
    fields.innerHTML = `
      <div class="form-control-group">
        <label class="form-label">관할 교육청 선택 <span class="required">*</span></label>
        <select class="select-field" id="socialSsoOffice" required>
          <option value="서울특별시교육청">서울특별시교육청</option>
          <option value="경기도교육청">경기도교육청</option>
          <option value="인천광역시교육청">인천광역시교육청</option>
          <option value="부산광역시교육청">부산광역시교육청</option>
          <option value="기타 시·도 교육청">기타 시·도 교육청</option>
        </select>
      </div>
      <div class="form-control-group">
        <label class="form-label">교직원 공공 이메일 (SSO 아이디) <span class="required">*</span></label>
        <input type="email" class="input-field" id="socialEmail" placeholder="teacher@sen.go.kr" value="teacher@sen.go.kr" required>
      </div>
      <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div class="form-control-group">
          <label class="form-label">교직원 성명 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialName" placeholder="예: 김영양 교사" value="김영양 교사" required>
        </div>
        <div class="form-control-group">
          <label class="form-label">소속 학교명 <span class="required">*</span></label>
          <input type="text" class="input-field" id="socialSchool" placeholder="예: 안심초등학교" value="안심초등학교" required>
        </div>
      </div>
    `;
    submitBtn.style.backgroundColor = 'var(--primary-color)';
    submitBtn.style.color = '#ffffff';
    submitBtn.style.borderColor = 'var(--primary-color)';
    submitBtn.textContent = '교육청 SSO 인증 완료 및 로그인';
  }

  modal.classList.add('open');
}

function closeSocialAuthModal() {
  const modal = document.getElementById('socialAuthModal');
  if (modal) modal.classList.remove('open');
}

function handleSocialAuthSubmit(e) {
  e.preventDefault();
  const provider = document.getElementById('socialProvider').value;
  const email = document.getElementById('socialEmail').value.trim();
  const name = document.getElementById('socialName').value.trim();
  const schoolName = document.getElementById('socialSchool').value.trim();

  const userData = {
    email,
    name,
    schoolName,
    userType: '영양교사/조리사',
    authProvider: provider,
    loginDate: new Date().toLocaleString()
  };

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
  saveUserToAdminList(userData, `${provider} 간편가입`);

  closeSocialAuthModal();
  updateAuthHeaderUI();

  alert(`🎉 [${provider}] 인증 및 가입/로그인 완료!\n\n${schoolName} ${name}님, ${provider} 정보 인증이 정상적으로 완료되었습니다.`);
  if (typeof showToast === 'function') {
    showToast(`'${name}'님 [${provider}] 간편 인증 및 로그인이 완료되었습니다.`);
  }
}

function saveUserToAdminList(userData, providerName = '일반 회원가입') {
  try {
    const listKey = 'pulmuone_partner_users';
    const usersStr = localStorage.getItem(listKey);
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    const exists = users.some(u => u.email === userData.email);
    if (!exists) {
      users.unshift({
        joinDate: new Date().toLocaleString().slice(0, 16),
        userType: userData.userType || '영양교사/조리사',
        schoolName: userData.schoolName || '급식 파트너',
        name: userData.name || '파트너 회원',
        email: userData.email,
        tel: userData.tel || '010-1234-5678',
        authProvider: providerName,
        status: '승인 완료'
      });
      localStorage.setItem(listKey, JSON.stringify(users));
    }
  } catch (err) {
    console.error('saveUserToAdminList error:', err);
  }
}

// -------------------------------------------------------------
// 5. 고객센터 모달 및 탭 제어
// -------------------------------------------------------------
function openCsModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('userCsModal');
  if (modal) modal.classList.add('open');
}

function closeCsModal() {
  const modal = document.getElementById('userCsModal');
  if (modal) modal.classList.remove('open');
}

function switchCsTab(tabNum) {
  const btn1 = document.getElementById('csTabBtn1');
  const btn2 = document.getElementById('csTabBtn2');
  const btn3 = document.getElementById('csTabBtn3');
  const content1 = document.getElementById('csTabContent1');
  const content2 = document.getElementById('csTabContent2');
  const content3 = document.getElementById('csTabContent3');

  [btn1, btn2, btn3].forEach(b => b.classList.remove('active'));
  [content1, content2, content3].forEach(c => c.style.display = 'none');

  if (tabNum === 1) {
    btn1.classList.add('active');
    content1.style.display = 'block';
  } else if (tabNum === 2) {
    btn2.classList.add('active');
    content2.style.display = 'block';
  } else if (tabNum === 3) {
    btn3.classList.add('active');
    content3.style.display = 'block';
  }
}

function toggleFaq(questionEl) {
  const item = questionEl.parentElement;
  item.classList.toggle('open');
}

function handleCsSubmit(e) {
  e.preventDefault();
  const category = document.getElementById('csCategory').value;
  const name = document.getElementById('csName').value.trim();
  
  alert(`✅ 1:1 상담 문의가 성공적으로 접수되었습니다.\n\n- 문의유형: ${category}\n- 신청자: ${name}\n\n담당 대리점 매니저가 확인 후 입력하신 연락처로 신속히 답변 드리겠습니다.`);
  document.getElementById('csInquiryForm').reset();
  closeCsModal();

  if (typeof showToast === 'function') {
    showToast('고객센터 1:1 문의 접수가 완료되었습니다.');
  }
}
