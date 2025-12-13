# Cloudflare API 토큰 생성 가이드

## 🔑 API 토큰 권한 설정

Cloudflare Pages 배포 및 D1 데이터베이스 관리를 위한 API 토큰 생성 방법입니다.

---

## 📋 필수 권한 목록

### 1️⃣ **Cloudflare Pages 배포용**

#### 접속 경로
1. Cloudflare Dashboard 로그인: https://dash.cloudflare.com/
2. 우측 상단 프로필 클릭 → **My Profile**
3. 좌측 메뉴 **API Tokens** 클릭
4. **Create Token** 버튼 클릭

#### 권한 설정

**Token name**: `job-matching-platform-deploy`

**Permissions (권한)**:

| Zone / Account | Permission | Access |
|----------------|------------|--------|
| Account | **Cloudflare Pages** | **Edit** |
| Account | **D1** | **Edit** |
| Zone | **DNS** | **Edit** |
| Zone | **Zone** | **Read** |

**Account Resources (계정 리소스)**:
- Include → **All accounts** (또는 특정 계정 선택)

**Zone Resources (도메인 리소스)**:
- Include → **Specific zone** → `feezone.site` 선택
- 또는 **All zones**

**Client IP Address Filtering (선택사항)**:
- 보안을 위해 특정 IP만 허용 가능
- 비워두면 모든 IP에서 사용 가능

**TTL (Time to Live)**:
- 만료 기간 설정 (선택사항)
- 영구 사용하려면 비워두기

---

## 🎯 상세 권한 설명

### ✅ Account - Cloudflare Pages: Edit
```
목적: Pages 프로젝트 생성, 배포, 설정 변경
필요한 작업:
- wrangler pages deploy
- wrangler pages project create
- wrangler pages domain add
```

### ✅ Account - D1: Edit
```
목적: D1 데이터베이스 생성 및 관리
필요한 작업:
- wrangler d1 create
- wrangler d1 migrations apply
- wrangler d1 execute
```

### ✅ Zone - DNS: Edit
```
목적: 커스텀 도메인 DNS 레코드 관리
필요한 작업:
- CNAME 레코드 자동 추가
- 도메인 연결 시 DNS 설정
```

### ✅ Zone - Zone: Read
```
목적: 도메인 정보 조회
필요한 작업:
- 도메인 상태 확인
- 배포 검증
```

---

## 🔧 API 토큰 생성 단계별 가이드

### Step 1: Custom Token 생성
```
Cloudflare Dashboard → My Profile → API Tokens → Create Token
→ "Create Custom Token" 선택
```

### Step 2: 기본 정보 입력
```
Token name: job-matching-platform-deploy
```

### Step 3: Permissions 추가

**첫 번째 권한**:
```
Resource: Account
Permission: Cloudflare Pages
Access: Edit
```

**두 번째 권한**:
```
Resource: Account  
Permission: D1
Access: Edit
```

**세 번째 권한**:
```
Resource: Zone
Permission: DNS
Access: Edit
```

**네 번째 권한**:
```
Resource: Zone
Permission: Zone
Access: Read
```

### Step 4: Account Resources 설정
```
Include → All accounts
(또는 특정 계정 선택)
```

### Step 5: Zone Resources 설정
```
Include → Specific zone → feezone.site
(또는 All zones in all accounts)
```

### Step 6: 생성 및 복사
```
1. Continue to summary 클릭
2. Create Token 클릭
3. 생성된 토큰 복사 (⚠️ 한 번만 표시됨!)
```

---

## 📝 토큰 저장 방법

### 로컬 개발 환경
```bash
# .bashrc 또는 .zshrc에 추가
export CLOUDFLARE_API_TOKEN="your-token-here"

# 또는 프로젝트별 .dev.vars 파일
echo "CLOUDFLARE_API_TOKEN=your-token-here" > .dev.vars
```

### Sandbox 환경
```bash
# setup_cloudflare_api_key 도구 사용
# 또는 수동 설정
echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

---

## ✅ 토큰 검증 방법

### 터미널에서 확인
```bash
# 토큰 설정 확인
npx wrangler whoami

# 예상 출력:
# ⛅️ wrangler 4.53.0
# Getting User settings...
# 👋 You are logged in with an API Token
# Account Name: your-account-name
# Account ID: your-account-id
```

### 배포 테스트
```bash
# D1 데이터베이스 생성 테스트
npx wrangler d1 create test-db

# Pages 프로젝트 생성 테스트  
npx wrangler pages project create test-project
```

---

## 🔒 보안 권장사항

### ✅ DO (권장)
- **토큰을 환경 변수로 저장**
- **.gitignore에 .dev.vars 추가**
- **최소 권한 원칙** (필요한 권한만 부여)
- **정기적으로 토큰 재생성**
- **TTL 설정** (만료 기간 지정)

### ❌ DON'T (금지)
- **토큰을 코드에 하드코딩**
- **GitHub에 토큰 커밋**
- **토큰을 공개 채널에 공유**
- **Global API Key 사용** (덜 안전함)

---

## 🚀 토큰 사용 예시

### 프로덕션 배포
```bash
# 환경 변수 설정 후
export CLOUDFLARE_API_TOKEN="your-token-here"

# D1 데이터베이스 생성
npx wrangler d1 create job-matching-production

# 출력값에서 database_id 복사 → wrangler.jsonc에 추가

# 프로덕션 마이그레이션
npx wrangler d1 migrations apply job-matching-production

# 빌드
npm run build

# 배포
npx wrangler pages deploy dist --project-name job-matching-platform

# 커스텀 도메인 추가
npx wrangler pages domain add feezone.site --project-name job-matching-platform
```

---

## 🔗 참고 링크

- **API 토큰 생성**: https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Pages 문서**: https://developers.cloudflare.com/pages/
- **D1 데이터베이스 문서**: https://developers.cloudflare.com/d1/
- **Wrangler CLI 문서**: https://developers.cloudflare.com/workers/wrangler/

---

## 📞 토큰 문제 해결

### 문제 1: "Authentication error" 발생
```bash
# 해결: 토큰이 올바르게 설정되었는지 확인
echo $CLOUDFLARE_API_TOKEN

# 토큰 재설정
export CLOUDFLARE_API_TOKEN="new-token"
npx wrangler whoami
```

### 문제 2: "Insufficient permissions" 발생
```
해결: API 토큰 권한 재확인
- Account - Cloudflare Pages: Edit ✅
- Account - D1: Edit ✅
- Zone - DNS: Edit ✅
- Zone - Zone: Read ✅
```

### 문제 3: "Resource not accessible" 발생
```
해결: Account/Zone Resources 설정 확인
- 올바른 계정 선택했는지
- 올바른 도메인 선택했는지
```

---

## 📋 요약: 최소 필요 권한

```yaml
API Token Name: job-matching-platform-deploy

Permissions:
  - Account:
      - Cloudflare Pages: Edit
      - D1: Edit
  - Zone:
      - DNS: Edit
      - Zone: Read

Account Resources:
  - All accounts (또는 특정 계정)

Zone Resources:
  - feezone.site (또는 All zones)
```

이 설정으로 API 토큰을 생성하시면 됩니다! 🎉
