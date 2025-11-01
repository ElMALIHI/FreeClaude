// Test script for Claude OpenAI Wrapper
// Usage: node test.js [API_KEY]

const API_KEY = process.argv[2] || 'your_api_key_here';
const BASE_URL = 'http://localhost:3000/v1';

async function testChatCompletion() {
  console.log('\n🧪 Testing Chat Completion...');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4',
        conversation_id: 'test-conversation-' + Date.now(),
        messages: [
          { role: 'user', content: 'Say hello in 5 words or less' }
        ]
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Success:', data.choices[0].message.content);
    } else {
      console.log('❌ Error:', data);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

async function testStreamingCompletion() {
  console.log('\n🧪 Testing Streaming Completion...');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4',
        conversation_id: 'test-stream-' + Date.now(),
        messages: [
          { role: 'user', content: 'Count from 1 to 5' }
        ],
        stream: true
      })
    });
    
    if (!response.ok) {
      console.log('❌ Error:', await response.text());
      return;
    }

    console.log('✅ Streaming response:');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) process.stdout.write(content);
          } catch (e) {}
        }
      }
    }
    console.log('\n');
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

async function testEdits() {
  console.log('\n🧪 Testing Edits Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/edits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: 'I loves programming',
        instruction: 'Fix grammar errors',
        model: 'claude-sonnet-4'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Success:', data.choices[0].text);
    } else {
      console.log('❌ Error:', data);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

async function testEmbeddings() {
  console.log('\n🧪 Testing Embeddings Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: 'Hello world',
        model: 'claude-3-7-sonnet'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Success: Generated embedding with', data.data[0].embedding.length, 'dimensions');
    } else {
      console.log('❌ Error:', data);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

async function runTests() {
  console.log('🚀 Claude OpenAI Wrapper Test Suite');
  console.log('📍 Base URL:', BASE_URL);
  console.log('🔑 API Key:', API_KEY.slice(0, 10) + '...');
  
  await testChatCompletion();
  await testStreamingCompletion();
  await testEdits();
  await testEmbeddings();
  
  console.log('\n✨ All tests completed!');
}

runTests().catch(console.error);
