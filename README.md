# 우분투에서 GitHub Actions 실습 환경 구축

## 1. 우분투 환경 준비

### 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 필수 패키지 설치
```bash
sudo apt install -y git curl wget vim nano tree
```

### Git 설정
```bash
# Git 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Git 기본 브랜치 설정
git config --global init.defaultBranch main

# Git 설정 확인
git config --list
```

## 2. Node.js 설치 (Node.js 프로젝트용)

### NodeSource 저장소를 통한 설치
```bash
# NodeSource GPG 키 추가
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Node.js 20.x 저장소 추가
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# 패키지 목록 업데이트 및 Node.js 설치
sudo apt update
sudo apt install -y nodejs

# 설치 확인
node --version
npm --version
```

### 또는 nvm을 통한 설치 (권장)
```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 또는 source 명령어 실행
source ~/.bashrc

# Node.js LTS 버전 설치
nvm install --lts
nvm use --lts

# 설치 확인
node --version
npm --version
```

## 3. 첫 번째 실습 프로젝트 생성

### 프로젝트 디렉토리 생성
```bash
mkdir github-actions-practice
cd github-actions-practice
```

### Git 저장소 초기화
```bash
git init
```

### Node.js 프로젝트 초기화
```bash
npm init -y
```

### 의존성 설치
```bash
npm install express
npm install --save-dev jest supertest nodemon
```

### 프로젝트 구조 생성
```bash
# 디렉토리 생성
mkdir -p .github/workflows src tests

# 기본 파일 생성
touch src/app.js tests/app.test.js .gitignore README.md
```

### package.json 수정
```bash
nano package.json
```

다음 내용으로 수정:
```json
{
  "name": "github-actions-practice",
  "version": "1.0.0",
  "description": "GitHub Actions 실습 프로젝트",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": ["github-actions", "ci-cd", "nodejs"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
```

### Express 앱 생성
```bash
nano src/app.js
```

다음 내용 입력:
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Hello, GitHub Actions!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API 엔드포인트
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };
```

### 테스트 파일 생성
```bash
nano tests/app.test.js
```

다음 내용 입력:
```javascript
const request = require('supertest');
const { app, server } = require('../src/app');

describe('Express App', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Hello, GitHub Actions!');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});
```

### .gitignore 파일 생성
```bash
nano .gitignore
```

다음 내용 입력:
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Logs
logs
*.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build output
dist/
build/

# Test output
test-results/
coverage/
```

## 4. GitHub Actions 워크플로우 생성

### 기본 CI 워크플로우
```bash
nano .github/workflows/ci.yml
```

다음 내용 입력:
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Test application startup
      run: |
        npm start &
        sleep 5
        curl http://localhost:3000/health
        pkill -f "node src/app.js"

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Create build info
      run: |
        mkdir -p build
        echo "Build completed at $(date)" > build/build-info.txt
        echo "Git commit: ${{ github.sha }}" >> build/build-info.txt
        echo "Branch: ${{ github.ref_name }}" >> build/build-info.txt
        
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-${{ github.run_number }}
        path: |
          build/
          src/
          package.json
        retention-days: 30
```

### 고급 워크플로우 생성
```bash
nano .github/workflows/advanced.yml
```

다음 내용 입력:
```yaml
name: Advanced Pipeline

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'  # 매주 월요일 오전 2시

env:
  NODE_VERSION: '20.x'

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Check code formatting
      run: |
        # Prettier 설치 및 실행 (실제 프로젝트에서는 package.json에 추가)
        npx prettier --check "src/**/*.js" "tests/**/*.js" || echo "Formatting check completed"

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run security audit
      run: npm audit --audit-level high
      
    - name: Check for vulnerable dependencies
      run: |
        npm audit --json > audit-results.json || true
        echo "Security audit completed"

  test-coverage:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests with coverage
      run: npm test -- --coverage || npm test
      
    - name: Upload coverage reports
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: coverage-report
        path: coverage/

  deploy-staging:
    needs: [lint-and-format, security-scan, test-coverage]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: staging
      url: https://staging.example.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: |
        echo "Building application for staging..."
        mkdir -p dist
        cp -r src/ dist/
        cp package.json dist/
        
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        echo "Deployment completed at $(date)"

  deploy-production:
    needs: [lint-and-format, security-scan, test-coverage]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    
    environment:
      name: production
      url: https://production.example.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: |
        echo "Building application for production..."
        mkdir -p dist
        cp -r src/ dist/
        cp package.json dist/
        
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        echo "Version: ${{ github.ref_name }}"
        echo "Deployment completed at $(date)"
```

## 5. 로컬 테스트

### 애플리케이션 테스트
```bash
# 의존성 설치
npm install

# 테스트 실행
npm test

# 개발 서버 실행 (새 터미널에서)
npm run dev

# API 테스트 (또 다른 터미널에서)
curl http://localhost:3000
curl http://localhost:3000/health
curl http://localhost:3000/api/users
```

## 6. GitHub에 푸시

### GitHub에 새 저장소 생성
1. GitHub에 로그인
2. 우상단 '+' 버튼 클릭 > New repository
3. 저장소 이름: `github-actions-practice`
4. Public 또는 Private 선택
5. Create repository 클릭

## 7. GitHub 푸시하기

### 🎯 GitHub에서 빈 저장소 생성 후 연결

#### 1단계: 로컬에서 커밋까지 완료
```bash
# 현재 Git 상태 확인
git status

# 모든 파일을 스테이징 영역에 추가
git add .

# 스테이징된 파일들 확인
git status

# 첫 번째 커밋
git commit -m "Initial commit: GitHub Actions 실습 프로젝트 설정

- Express.js 앱 기본 구조
- Jest 테스트 설정
- GitHub Actions 워크플로우 파일
- 기본 CI/CD 파이프라인 구성"

# 커밋 확인
git log --oneline
```

#### 2단계: GitHub에서 빈 저장소 생성
1. [GitHub.com](https://github.com)에 로그인
2. 우상단 **+** 버튼 클릭 → **New repository** 선택
3. Repository 설정:
   - **Repository name**: `github-actions-practice`
   - **Description**: `GitHub Actions 실습용 프로젝트` (선택사항)
   - **Public** 또는 **Private** 선택
   - **⚠️ 중요: 아무것도 체크하지 않기**
     - ❌ **Add a README file** 체크 해제
     - ❌ **Add .gitignore** 체크 해제
     - ❌ **Choose a license** 선택 안함
4. **Create repository** 클릭

#### 3단계: GitHub 저장소 생성 후 안내 페이지 활용
저장소 생성 후 나타나는 페이지에서 **"…or push an existing repository from the command line"** 섹션의 명령어를 그대로 복사해서 사용:

```bash
# GitHub에서 제공하는 명령어 (SSH 사용 시)
git remote add origin git@github.com:YOUR_USERNAME/github-actions-practice.git
git branch -M main
git push -u origin main
```

또는

```bash
# HTTPS 사용 시 (토큰 필요)
git remote add origin https://github.com/YOUR_USERNAME/github-actions-practice.git  
git branch -M main
git push -u origin main
```

#### HTTPS + 토큰 사용
```bash
# credential helper 설정 (처음 한 번만)
git config --global credential.helper store

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/github-actions-practice.git

# 푸시 (인증 정보 입력 요구됨)
git push -u origin main

# 입력 프롬프트:
# Username for 'https://github.com': YOUR_GITHUB_USERNAME
# Password for 'https://YOUR_USERNAME@github.com': YOUR_PERSONAL_ACCESS_TOKEN
```

### ✅ 푸시 성공 확인

```bash
# 원격 저장소 연결 상태 확인
git remote -v
# origin	git@github.com:username/github-actions-practice.git (fetch)
# origin	git@github.com:username/github-actions-practice.git (push)

# 브랜치 추적 상태 확인
git branch -vv
# * main abc1234 [origin/main] Initial commit: GitHub Actions 실습 프로젝트 설정

# 원격 저장소 정보 확인
git remote show origin
```

### 🎬 GitHub에서 Actions 확인

푸시가 완료되면:

1. **브라우저에서 저장소 확인**
   - GitHub 저장소 페이지로 이동
   - 파일들이 업로드되었는지 확인
   - README.md 내용이 표시되는지 확인

2. **GitHub Actions 실행 확인**
   - 저장소 상단의 **Actions** 탭 클릭
   - "CI Pipeline" 워크플로우가 실행 중이거나 완료되었는지 확인
   - 워크플로우를 클릭하여 상세 로그 확인

3. **실행 결과 분석**
   - ✅ 녹색 체크: 성공
   - ❌ 빨간 X: 실패 (로그 확인 필요)
   - 🟡 노란 원: 실행 중

### 🚨 문제 해결

#### 인증 오류
```bash
# SSH 키 문제
ssh -vT git@github.com  # 상세 디버깅

# HTTPS 토큰 문제
git config --global --unset credential.helper
rm ~/.git-credentials  # 저장된 잘못된 인증 정보 삭제
```

#### 원격 저장소 연결 오류
```bash
# 현재 원격 저장소 확인
git remote -v

# 잘못 설정된 경우 제거 후 다시 추가
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/github-actions-practice.git
```

#### 브랜치 이름 문제
```bash
# 현재 브랜치 확인
git branch

# main 브랜치가 아닌 경우 변경
git branch -M main
```

이 방법이 GitHub CLI 없이 가장 표준적이고 안전한 방법입니다!

### Actions 실행 확인
1. GitHub 저장소 페이지에서 'Actions' 탭 클릭
2. 워크플로우 실행 상태 확인
3. 로그 확인 및 분석

## 8. 추가 실습을 위한 명령어

### 새 기능 브랜치 생성
```bash
git checkout -b feature/new-endpoint
```

### 새 엔드포인트 추가 후 푸시
```bash
# 파일 수정 후
git add .
git commit -m "Add new API endpoint"
git push -u origin feature/new-endpoint
```

### Pull Request 생성하여 CI 테스트

### 태그 생성하여 배포 워크플로우 테스트
```bash
git tag v1.0.0
git push origin v1.0.0
```
