const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function checkApiHealth() {
  try {
    console.log(`🔍 Checking API health at: ${API_BASE_URL}/health`);
    
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log('✅ API is healthy!');
      console.log('📊 Gateway available:', data.gateway);
      return true;
    } else {
      console.log('❌ API health check failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error.message);
    return false;
  }
}

checkApiHealth();
