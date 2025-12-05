import axios from 'axios';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

/**
 * News Input Service - Handles URL fetching, PDF/DOCX extraction, and text processing
 */
class NewsInputService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  /**
   * Fetch news article from URL with retry mechanism
   * @param {string} url - The URL to fetch
   * @returns {Promise<Object>} - Processed article data
   */
  async fetchNewsFromURL(url) {
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.axiosInstance.get(url);
        const html = response.data;
        
        // Load HTML into cheerio for parsing
        const $ = cheerio.load(html);
        
        // Remove unwanted elements
        $('script, style, nav, header, footer, aside, .advertisement, .ads, .cookie-banner').remove();
        
        // Try to find main article content using common selectors
        let articleText = '';
        const articleSelectors = [
          'article',
          '[role="main"]',
          '.article-content',
          '.post-content',
          '.entry-content',
          '.main-content',
          '#main-content',
          '.content',
          'main'
        ];
        
        for (const selector of articleSelectors) {
          const element = $(selector);
          if (element.length > 0) {
            articleText = element.text().trim();
            break;
          }
        }
        
        // Fallback to body if no article found
        if (!articleText) {
          articleText = $('body').text().trim();
        }
        
        // Clean up the text
        articleText = this._cleanExtractedText(articleText);
        
        if (!articleText || articleText.length < 50) {
          throw new Error('Article content too short or not found');
        }
        
        const language = this.detectLanguage(articleText);
        
        return {
          success: true,
          text: articleText,
          sourceType: 'url',
          language: language,
          error: null
        };
        
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    return {
      success: false,
      text: '',
      sourceType: 'url',
      language: null,
      error: lastError.message === 'Article content too short or not found' 
        ? 'Article content too short or not found' 
        : 'URL unreachable'
    };
  }

  /**
   * Extract text from PDF file
   * @param {Buffer} file - PDF file buffer
   * @returns {Promise<Object>} - Extracted text data
   */
  async extractTextFromPDF(file) {
    try {
      const data = await pdf(file);
      let text = data.text;
      
      // Remove common PDF artifacts and page numbers
      text = text.replace(/^\d+\s*$/gm, ''); // Remove standalone numbers (page numbers)
      text = text.replace(/^\s*[A-Z][A-Z\s]+\s*$/gm, ''); // Remove headers in all caps
      text = text.replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
      
      text = this._cleanExtractedText(text);
      
      if (!text || text.length < 10) {
        throw new Error('PDF text content too short');
      }
      
      const language = this.detectLanguage(text);
      
      return {
        success: true,
        text: text,
        sourceType: 'pdf',
        language: language,
        error: null
      };
      
    } catch (error) {
      return {
        success: false,
        text: '',
        sourceType: 'pdf',
        language: null,
        error: 'PDF decoding failed'
      };
    }
  }

  /**
   * Extract text from DOCX file
   * @param {Buffer} file - DOCX file buffer
   * @returns {Promise<Object>} - Extracted text data
   */
  async extractTextFromDOCX(file) {
    try {
      const result = await mammoth.extractRawText({ buffer: file });
      let text = result.value;
      
      // Clean up DOCX formatting artifacts
      text = text.replace(/\r\n/g, '\n'); // Normalize line endings
      text = text.replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
      text = text.replace(/^\s*-\s*/gm, ''); // Remove bullet points
      
      text = this._cleanExtractedText(text);
      
      if (!text || text.length < 10) {
        throw new Error('DOCX text content too short');
      }
      
      const language = this.detectLanguage(text);
      
      return {
        success: true,
        text: text,
        sourceType: 'docx',
        language: language,
        error: null
      };
      
    } catch (error) {
      return {
        success: false,
        text: '',
        sourceType: 'docx',
        language: null,
        error: 'DOCX decoding failed'
      };
    }
  }

  /**
   * Sanitize input text
   * @param {string} text - Raw text input
   * @returns {Object} - Sanitized text data
   */
  sanitizeInputText(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
      }
      
      let cleanedText = text;
      
      // Remove HTML tags
      cleanedText = cleanedText.replace(/<[^>]*>/g, '');
      
      // Remove emojis and special characters
      cleanedText = cleanedText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
      
      // Remove control characters
      cleanedText = cleanedText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // Convert smart quotes to standard quotes
      cleanedText = cleanedText.replace(/[""]/g, '"');
      cleanedText = cleanedText.replace(/['']/g, "'");
      
      // Collapse multiple spaces
      cleanedText = cleanedText.replace(/\s+/g, ' ');
      
      // Trim whitespace
      cleanedText = cleanedText.trim();
      
      if (!cleanedText || cleanedText.length < 5) {
        throw new Error('Text content too short after cleaning');
      }
      
      const language = this.detectLanguage(cleanedText);
      
      return {
        success: true,
        text: cleanedText,
        sourceType: 'text',
        language: language,
        error: null
      };
      
    } catch (error) {
      return {
        success: false,
        text: '',
        sourceType: 'text',
        language: null,
        error: error.message === 'Invalid text input' ? 'Invalid text input' : 'Text content too short after cleaning'
      };
    }
  }

  /**
   * Detect language of text
   * @param {string} text - Text to analyze
   * @returns {string} - Language code (en, zh, vi, es, jp)
   */
  detectLanguage(text) {
    if (!text || text.length < 10) {
      return 'en'; // Default to English for short texts
    }
    
    // Simple language detection based on character patterns
    const samples = text.substring(0, 1000); // Sample first 1000 characters
    
    // Chinese detection
    if (/[\u4e00-\u9fff]/.test(samples)) {
      return 'zh';
    }
    
    // Japanese detection
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(samples)) {
      return 'jp';
    }
    
    // Vietnamese detection (common Vietnamese characters)
    if (/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]/.test(samples)) {
      return 'vi';
    }
    
    // Spanish detection (common Spanish words and characters)
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'está', 'como', 'pero', 'sus', 'le', 'ha', 'me', 'sin', 'sobre', 'este', 'ya', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'también', 'fue', 'había', 'parte', 'tiene', 'mismo', 'años', 'hasta', 'desde', 'están', 'ni', 'sí', 'día', 'tiempo', 'verdad', 'bien', 'conocer', 'hacer', 'vida', 'mundo', 'año', 'antes', 'después', 'cosas', 'tan', 'donde', 'entonces', 'dar', 'ahora', 'niño', 'ella', 'hecho', 'gente', 'madre', 'padre', 'casa', 'nada', 'nombre', 'ellas', 'ellas', 'ellas'];
    const spanishScore = spanishWords.filter(word => samples.toLowerCase().includes(word)).length;
    
    if (spanishScore > 2) {
      return 'es';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Process final input - auto-detect input type and process accordingly
   * @param {string|Buffer} input - Input data (URL string, file buffer, or text)
   * @param {string} inputType - Optional input type hint ('url', 'pdf', 'docx', 'text')
   * @returns {Promise<Object>} - Processed input data
   */
  async processFinalInput(input, inputType = null) {
    try {
      if (!input) {
        throw new Error('No input provided');
      }
      
      let detectedType = inputType;
      
      // Auto-detect input type if not provided
      if (!detectedType) {
        if (typeof input === 'string') {
          // Check if it's a URL
          if (this._isValidURL(input)) {
            detectedType = 'url';
          } else {
            detectedType = 'text';
          }
        } else if (Buffer.isBuffer(input)) {
          // For buffers, we need to detect file type by content
          detectedType = this._detectFileType(input);
        } else {
          throw new Error('Unsupported input type');
        }
      }
      
      let result;
      
      switch (detectedType) {
        case 'url':
          result = await this.fetchNewsFromURL(input);
          break;
        case 'pdf':
          result = await this.extractTextFromPDF(input);
          break;
        case 'docx':
          result = await this.extractTextFromDOCX(input);
          break;
        case 'text':
          result = this.sanitizeInputText(input);
          break;
        default:
          throw new Error('Unsupported file format');
      }
      
      // Final cleaning if successful
      if (result.success && result.text) {
        result.text = this._finalClean(result.text);
      }
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        text: '',
        sourceType: inputType || 'unknown',
        language: null,
        error: error.message || 'Processing failed'
      };
    }
  }

  /**
   * Helper method to clean extracted text
   * @private
   */
  _cleanExtractedText(text) {
    return text
      .replace(/\s+/g, ' ') // Collapse multiple whitespace
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Helper method for final cleaning
   * @private
   */
  _finalClean(text) {
    return text
      .replace(/^\s+|\s+$/g, '') // Trim overall
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();
  }

  /**
   * Validate URL
   * @private
   */
  _isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Detect file type from buffer
   * @private
   */
  _detectFileType(buffer) {
    // Check PDF signature
    if (buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }
    
    // Check DOCX signature (PK signature for ZIP files)
    if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
      return 'docx';
    }
    
    return 'unknown';
  }
}

export default NewsInputService;