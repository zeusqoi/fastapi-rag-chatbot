# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# pip install fastapi

from pydantic import BaseModel
# pip install pydantic

from dotenv import load_dotenv
# pip install python-dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# pip install langchain-openai
# pip install openai

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
# pip install langchain
# pip install langchain-community
# pip install chromadb

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"status": "FastAPI Server is running with ChromaDB Vector Store!"}

# 학생들에게 보여줄 가상의 교내 정보 데이터셋 (원시 데이터)
sample_documents = [
    Document(
        page_content="FastAPI 실습실은 공학관 301호에 있으며, 이용 시간은 평일 오전 9시부터 오후 6시까지입니다.",
        metadata={"source": "classroom_info"},
    ),
    Document(
        page_content="리액트(React) 프로젝트 과제 제출 기한은 2026년 7월 15일 자정까지이며, 기한 엄수 바랍니다.",
        metadata={"source": "homework_info"},
    ),
    Document(
        page_content="이번 IT 교육 과정의 담당 교수님은 양현수 교수님이며, 이메일은 yang@example.com 입니다.",
        metadata={"source": "professor_info"},
    ),
    Document(
        page_content="크로마DB(ChromaDB)는 오픈소스 벡터 데이터베이스로, 빠르고 간편하게 로컬 환경에 구축할 수 있는 장점이 있습니다.",
        metadata={"source": "db_info"},
    ),
]

# 텍스트를 벡터로 변환할 임베딩 모델 초기화
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 크로마DB 초기화 및 데이터 저장 (로컬./chroma_db 폴더에 저장)
# 서버가 켜질 때 고유한 텍스트들을 임베딩하여 DB에 채워 넣는다.
persistent_directory = "./chroma_db"
vector_store = Chroma.from_documents(
    documents=sample_documents,
    embedding=embeddings,
    persist_directory=persistent_directory
)

session_store = {}

def get_session_history(session_id: str):
    if session_id not in session_store:
        session_store[session_id] = ChatMessageHistory()
    return session_store[session_id]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "당신은 친절하고 전문적인 IT 교육 도우미 챗봇입니다. "
        "학생들이 프로그래밍 개념을 쉽게 이해할 수 있도록 명확하고 간결하게 한국어로 설명해주세요.",
    ),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

conversation_with_memory = RunnableWithMessageHistory(
    prompt | llm,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

# API 요청/응답 규격 정의 및 엔드포인트
class MessageRequest(BaseModel):
    message: str

# 데이터 검색 테스트를 위한 전용 요청 모델
class SearchRequest(BaseModel):
    query: str

# 엔드포인트
@app.post("/api/chat")
async def chat_endpoint(req: MessageRequest):
    user_message = req.message
    try:
        response = conversation_with_memory.invoke(
            {"input": user_message},
            config={"configurable": {"session_id":"student_1"}}
        )
        bot_reply = response.content
    except Exception as e:
        bot_reply = f"오류가 발생했습니다: {str(e)}"
    return {"reply": bot_reply}

# 학생들이 질문을 던졌을 때 LLM을 거치지 않고, DB에서 '가장 유사한 문서'를 뽑아오는 과정을 시각적으로 확인한다.
@app.post("/api/search")
async def search_endpoint(req: SearchRequest):
    student_query = req.query
    try:
        # 질문과 가장 유사한 문서 2개를 찾아온다. (k=2)
        results = vector_store.similarity_search(student_query, k=2)
        
        # 프론트엔드가 보기 편하게 포맷팅
        search_results = []
        for doc in results:
            search_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
        return {"status": "success", "results": search_results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}