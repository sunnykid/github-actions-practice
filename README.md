# GitHub Actions Practice

이 프로젝트는 GitHub Actions를 학습하기 위한 실습 프로젝트입니다.

## 설치 및 실행

### 의존성 설치
```bash
npm install
개발 서버 실행
bashnpm run dev
테스트 실행
bashnpm test
API 엔드포인트

GET / - 기본 메시지
GET /health - 헬스 체크
GET /api/users - 사용자 목록

CI/CD
이 프로젝트는 GitHub Actions를 사용하여 자동화된 테스트 및 배포를 수행합니다.

## 5. GitHub Actions 워크플로우 생성

### 기본 CI 워크플로우
```bash
nano .github/workflows/ci.yml
다음 내용 입력:
yamlname: CI Pipeline

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
고급 워크플로우 생성
bashnano .github/workflows/advanced.yml
다음 내용 입력:
yamlname: Advanced Pipeline

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
      uses: actions/upload-artifact@v3
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
