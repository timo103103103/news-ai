// Mock API service for demonstration purposes when backend is not available
export interface MockAPIResponse {
  success: boolean;
  text: string;
  sourceType: 'url' | 'pdf' | 'docx' | 'text';
  language: 'en' | 'zh' | 'vi' | 'es' | 'jp';
  error?: string;
}

export class MockNewsInputService {
  private mockResponses = {
    url: {
      success: true,
      text: "Breaking News: Major tech companies announce new AI initiatives that could revolutionize the industry. The announcement comes amid growing concerns about data privacy and regulatory oversight. Industry experts predict significant market impact with potential stock price fluctuations in the coming weeks.",
      sourceType: 'url' as const,
      language: 'en' as const
    },
    text: {
      success: true,
      text: "Global economic trends show mixed signals as inflation rates continue to fluctuate across major economies. Central banks are implementing new monetary policies to stabilize markets while addressing supply chain disruptions that have persisted since the pandemic.",
      sourceType: 'text' as const,
      language: 'en' as const
    },
    pdf: {
      success: true,
      text: "Financial Report Q4 2023: Revenue increased by 15% compared to previous quarter, driven by strong performance in emerging markets. The company's strategic investments in technology and sustainability initiatives have positioned it well for future growth opportunities.",
      sourceType: 'pdf' as const,
      language: 'en' as const
    },
    docx: {
      success: true,
      text: "Market Analysis Document: Consumer behavior patterns indicate a shift towards sustainable products and digital services. This trend presents both challenges and opportunities for traditional retailers who must adapt their business models to remain competitive.",
      sourceType: 'docx' as const,
      language: 'en' as const
    }
  };

  async simulateAPIResponse(inputType: 'url' | 'text' | 'pdf' | 'docx', input?: string): Promise<MockAPIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simulate occasional network errors (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network timeout - server not responding');
    }

    // Simulate validation errors (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        text: '',
        sourceType: inputType,
        language: 'en',
        error: 'Invalid input format. Please check your content and try again.'
      };
    }

    // Return mock response based on input type
    const response = this.mockResponses[inputType];
    
    // Add some variation to the text based on input
    if (input && inputType === 'url') {
      response.text = `Processed URL content: ${input.substring(0, 100)}... ${response.text}`;
    } else if (input && inputType === 'text') {
      response.text = input.length > 200 ? input : response.text;
    }

    return response;
  }

  async processURL(url: string): Promise<MockAPIResponse> {
    if (!url || !url.trim()) {
      return {
        success: false,
        text: '',
        sourceType: 'url',
        language: 'en',
        error: 'Please enter a valid URL'
      };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        success: false,
        text: '',
        sourceType: 'url',
        language: 'en',
        error: 'URL must start with http:// or https://'
      };
    }

    return this.simulateAPIResponse('url', url);
  }

  async processText(text: string): Promise<MockAPIResponse> {
    if (!text || !text.trim()) {
      return {
        success: false,
        text: '',
        sourceType: 'text',
        language: 'en',
        error: 'Please enter some text to analyze'
      };
    }

    if (text.trim().length < 10) {
      return {
        success: false,
        text: '',
        sourceType: 'text',
        language: 'en',
        error: 'Text must be at least 10 characters long'
      };
    }

    return this.simulateAPIResponse('text', text);
  }

  async processFile(file: File): Promise<MockAPIResponse> {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        text: '',
        sourceType: file.type.includes('pdf') ? 'pdf' : 'docx',
        language: 'en',
        error: 'Only PDF and DOCX files are supported'
      };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        success: false,
        text: '',
        sourceType: file.type.includes('pdf') ? 'pdf' : 'docx',
        language: 'en',
        error: 'File size must be less than 10MB'
      };
    }

    const fileType = file.type.includes('pdf') ? 'pdf' : 'docx';
    return this.simulateAPIResponse(fileType, file.name);
  }
}

export const mockNewsInputService = new MockNewsInputService();