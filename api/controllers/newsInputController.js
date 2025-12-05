import NewsInputService from '../services/newsInputService.js';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF and DOCX files are allowed.'), false);
    }
  }
});

const newsInputService = new NewsInputService();

/**
 * Process news input from URL
 */
const processURL = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const result = await newsInputService.fetchNewsFromURL(url);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      text: '',
      sourceType: 'url',
      language: null,
      error: 'Internal server error'
    });
  }
};

/**
 * Process news input from file upload (PDF or DOCX)
 */
const processFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const { mimetype, buffer } = req.file;
    let result;
    
    if (mimetype === 'application/pdf') {
      result = await newsInputService.extractTextFromPDF(buffer);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      result = await newsInputService.extractTextFromDOCX(buffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type'
      });
    }
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      text: '',
      sourceType: 'file',
      language: null,
      error: 'Internal server error'
    });
  }
};

/**
 * Process news input from direct text
 */
const processText = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const result = newsInputService.sanitizeInputText(text);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      text: '',
      sourceType: 'text',
      language: null,
      error: 'Internal server error'
    });
  }
};

/**
 * Process news input with auto-detection
 */
const processAuto = async (req, res) => {
  try {
    const { input, inputType } = req.body;
    
    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }
    
    // Convert base64 to buffer if it's a file
    let processedInput = input;
    if (inputType === 'pdf' || inputType === 'docx') {
      if (typeof input === 'string' && input.startsWith('data:')) {
        const base64Data = input.split(',')[1];
        processedInput = Buffer.from(base64Data, 'base64');
      }
    }
    
    const result = await newsInputService.processFinalInput(processedInput, inputType);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      text: '',
      sourceType: 'auto',
      language: null,
      error: 'Internal server error'
    });
  }
};

// Default export for router usage
export default {
  processURL,
  processFile: processFile,
  processText,
  processAuto
};

// Named exports for individual use
export {
  processURL,
  processFile as processFileMiddleware,
  processText,
  processAuto
};