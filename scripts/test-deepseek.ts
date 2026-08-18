
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testFetch() {
  console.log('Testing Fetch with /v1...');
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    console.log('Status:', response.status);
    if (!response.ok) {
      console.error(await response.text());
    } else {
      console.log('Success');
    }
  } catch (error) {
    console.error('Failed:', error);
  }
}

testFetch();
