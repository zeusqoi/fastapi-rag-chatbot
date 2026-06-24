// App.jsx

import { useState } from 'react'
import './App.css'

function App() {
  // 사용자가 입력하는 텍스트 상태
  const [inputText, setInputText] = useState("")

  // 화면에 보여줄 대화 기록 상태
  const [messages, SetMessages] = useState([])

  // DB 검색 영역 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 전송 버튼을 눌렀을 때 실행되는 함수
  const sendMessage = async () => {
    if(!inputText.trim()) return;

    // 사용자 메시지를 화면에 추가
    const newMessages = [...messages, {sender:"user", text:inputText}]
    SetMessages(newMessages)

    // 입력 후 전송하면 입력창 비우기
    const currentInput = inputText
    setInputText("")

    try{
      // FastAPI 서버로 메시지 전송
      const response = await fetch("http://127.0.0.1:8080/api/chat", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({message: currentInput})
      })

      // 서버로부터 받은 답변 처리
      const data = await response.json()

      // 봇의 답변을 대화 기록에 추가
      SetMessages((prev) => [...prev, {sender:"bot", text: data.reply}])
    }catch(error){
      console.error("서버 통신 에러:", error)
      SetMessages((prev) => [...prev, {sender:"bot", text:"서버와 연결할 수 없습니다."}])
    }
  }

  // 크로마 DB 검색 (/api/search)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch("http://localhost:8080/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 백엔드의 SearchRequest 모델({ query: str })에 맞춰 전송
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setSearchResults(data.results);
      } else {
        console.error("검색 실패:", data.message);
        alert("검색 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("검색 서버 통신 에러:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "50px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>교육 도우미 챗봇 & DB 검색 시스템</h1>
      
      {/* 화면을 2등분 하기 위해 Flexbox 사용 */}
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        
        {/* 왼쪽 영역: 기존 챗봇 (Chat) */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
          <h2>교육 도우미 챗봇</h2>
          
          {/* 채팅 내역 출력 영역 */}
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "auto", marginBottom: "10px", borderRadius: "8px" }}>
            {messages.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>대화를 시작해보세요!</p>}
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "10px 0" }}>
                <span style={{ 
                  background: msg.sender === "user" ? "#d1e7dd" : "#f8d7da", 
                  padding: "8px 12px", 
                  borderRadius: "10px",
                  display: "inline-block",
                  maxWidth: "80%"
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* 입력 및 전송 영역 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="질문을 입력하세요..."
              style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button onClick={sendMessage} style={{ padding: "10px 20px", cursor: "pointer" }}>전송</button>
          </div>
        </div>

        {/* 오른쪽 영역: 크로마DB 검색 (Search) */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
          <h2>DB 유사도 검색 (ChromaDB)</h2>
          
          {/* 검색 결과 출력 영역 */}
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "auto", marginBottom: "10px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
            {searchResults.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
                궁금한 키워드를 검색하면<br/>가장 유사한 원본 데이터가 표시됩니다.
              </p>
            ) : (
              searchResults.map((result, index) => (
                <div key={index} style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "12px", marginBottom: "10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "5px", fontWeight: "bold" }}>
                    출처 (Metadata): {result.metadata?.source || '알 수 없음'}
                  </div>
                  <div style={{ color: "#333", lineHeight: "1.4" }}>
                    {result.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 검색 입력 및 버튼 영역 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색할 내용을 입력하세요..."
              style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button onClick={handleSearch} style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px" }}>
              검색
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App