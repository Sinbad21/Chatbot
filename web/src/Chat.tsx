import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: { url?: string, source_id: string, chunk_id: string, snippet: string }[]
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            {msg.citations && msg.citations.map((c, j) => (
              <div key={j} style={{ marginLeft: '20px', fontSize: 'small' }}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">{c.source_id}</a>: {c.snippet}
              </div>
            ))}
          </div>
        ))}
        {loading && <div>Loading...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          style={{ width: '70%', padding: '10px' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: '10px' }}>Send</button>
      </div>
    </div>
  )
}

export default Chat