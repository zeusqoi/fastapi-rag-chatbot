### FastAPI RAG Chatbot
FastAPI와 React를 활용한 LangChain · ChromaDB 기반 AI 챗봇 및 벡터 검색 실습 프로젝트

### 프로젝트 소개
백엔드는 FastAPI를 사용하여 REST API 서버를 구축하고, 프론트엔드는 React(Vite)를 사용하여 사용자 인터페이스를 구현하였다. OpenAI API와 LangChain을 활용하여 사용자와 자연스러운 대화를 수행하며, ChromaDB 벡터 데이터베이스를 이용한 유사도 검색 기능을 함께 제공한다.

사용자의 질문을 벡터로 변환하여 저장된 문서와의 유사도를 비교하고, 가장 관련성이 높은 정보를 검색할 수 있도록 구성하였다. 이를 통해 LLM 기반 챗봇과 벡터 검색 시스템의 동작 원리를 학습할 수 있다.

### 기술 스택
#### Backend
- Python
- FastAPI
- LangChain
- OpenAI API
- ChromaDB
- OpenAI Embeddings
- Python-dotenv

#### Frontend
- React
- Vite
- JavaScript
- CSS

### 실행 방법
#### Backend
```bash
cd backend
uvicorn main:app --reload --port 8080
```

#### Frontend
```bash
cd frontend/product-app
npm install
npm run dev -- --port 3000
```

### 주요 기능
#### AI 챗봇
- OpenAI API 기반 자연어 대화
- LangChain Conversation Memory 활용
- 이전 대화 내용을 유지하는 대화형 챗봇
- FastAPI REST API를 통한 채팅 서비스 제공

#### ChromaDB 벡터 검색
- OpenAI Embedding 모델을 활용한 텍스트 벡터화
- ChromaDB 벡터 데이터베이스 구축
- 사용자 질문과 가장 유사한 문서 검색
- 검색 결과의 메타데이터 및 원본 문서 확인 가능

#### 프론트엔드
- React 기반 사용자 인터페이스
- 실시간 채팅 기능
- 벡터 검색 결과 시각화
- API 기반 백엔드 연동

### 프로젝트 구조
```text
fastapi-rag-chatbot
├── backend
│   ├── chroma_db
│   ├── main.py
│   └── requirements.txt
│
└── frontend
    └── product-app
        ├── src
        │   ├── App.jsx
        │   └── App.css
        └── package.json
```

### 프로젝트 목적
- FastAPI를 활용한 REST API 개발 학습
- React 기반 프론트엔드 구현
- OpenAI API를 활용한 LLM 서비스 개발
- LangChain Memory 기능 학습
- Embedding 개념 이해
- ChromaDB 벡터 데이터베이스 활용
- RAG(Retrieval-Augmented Generation)의 기본 원리 학습
- 백엔드와 프론트엔드 연동 학습
