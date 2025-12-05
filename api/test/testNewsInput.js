// Since this is an ES module environment, we need to use dynamic import
const testNewsInputService = async () => {
  try {
    const { default: NewsInputService } = await import('../services/newsInputService.js');
    
    const newsInputService = new NewsInputService();
    
    console.log('🧪 Testing NewsInputService...\n');
    
    // Test 1: Text processing
    console.log('📋 Test 1: Text Processing');
    const testText = "This is a sample news article about technology. It contains information about AI and machine learning. The article discusses how these technologies are changing the world.";
    const textResult = newsInputService.sanitizeInputText(testText);
    console.log('✅ Text result:', textResult.success ? 'SUCCESS' : 'FAILED');
    console.log('   Language:', textResult.language);
    console.log('   Text length:', textResult.text.length);
    console.log('');
    
    // Test 2: Language detection
    console.log('🌍 Test 2: Language Detection');
    const chineseText = "这是一个关于科技的新闻文章。它包含了关于人工智能和机器学习的信息。";
    const chineseResult = newsInputService.detectLanguage(chineseText);
    console.log('✅ Chinese detection:', chineseResult === 'zh' ? 'SUCCESS' : 'FAILED');
    console.log('   Detected language:', chineseResult);
    console.log('');
    
    // Test 3: URL validation
    console.log('🔗 Test 3: URL Validation');
    const validUrl = "https://example.com/article";
    const invalidUrl = "not-a-url";
    console.log('✅ Valid URL:', newsInputService._isValidURL(validUrl) ? 'SUCCESS' : 'FAILED');
    console.log('✅ Invalid URL:', !newsInputService._isValidURL(invalidUrl) ? 'SUCCESS' : 'FAILED');
    console.log('');
    
    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run tests
testNewsInputService();