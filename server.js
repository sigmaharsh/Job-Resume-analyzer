// Import required modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Initialize Google Generative AI with Gemini Flash 2.0
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only PDF, DOCX, and text files
        const filetypes = /pdf|docx|doc|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    }
});

// Function to extract text from PDF files
async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

// Function to extract text from DOCX files using mammoth
async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw error;
    }
}

// Function to extract text based on file type
async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
        return await extractTextFromPDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
        return await extractTextFromDOCX(filePath);
    } else if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf8');
    } else {
        throw new Error('Unsupported file type');
    }
}

// Function to analyze resume and job description using Gemini Flash 2.0
async function analyzeResumeAndJob(resumeText, jobText) {
    // Truncate texts if they're too long (API has token limits)
    const maxLength = 8000;
    const truncatedResumeText = resumeText.length > maxLength ? resumeText.substring(0, maxLength) + "..." : resumeText;
    const truncatedJobText = jobText.length > maxLength ? jobText.substring(0, maxLength) + "..." : jobText;

    // Create prompt for Gemini
    const prompt = `
  Please analyze this resume and job description in detail.

  RESUME:
  ${truncatedResumeText}

  JOB DESCRIPTION:
  ${truncatedJobText}

  I need a comprehensive analysis with the following details:
  1. A brief summary of the resume (key skills, experience, education)
  2. A brief summary of the job description (key requirements, responsibilities)
  3. Calculate a percentage match between the resume and job description (be precise and objective)
  4. List the specific matched skills found in both documents
  5. List the specific missing skills that are in the job description but not in the resume
  6. If the match percentage is below 80%, provide a detailed roadmap for improving eligibility
  7. Provide 5-7 actionable tips to enhance the resume for this specific role

  Format your response EXACTLY as a JSON object with the following structure:
  {
    "resumeSummary": "...",
    "jobSummary": "...",
    "matchPercentage": XX, (a number between 0-100)
    "matchedSkills": ["skill1", "skill2", ...],
    "missingSkills": ["skill1", "skill2", ...],
    "roadmap": "...",
    "tips": ["tip1", "tip2", ...]
  }

  Be detailed and specific in your analysis. Focus on both technical skills and soft skills.
  `;

    try {
        // Generate content with Gemini
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096
            }
        });

        const response = result.response;
        const analysisText = response.text();

        // Extract the JSON from the response
        // We need to handle potential text before or after the JSON
        let jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Failed to extract JSON from Gemini response");
        }
    } catch (error) {
        console.error('Gemini API error:', error);

        // If we can't use Gemini, return a mock response for demonstration
        return {
            resumeSummary: "Could not generate summary due to API error. Please try again later.",
            jobSummary: "Could not generate summary due to API error. Please try again later.",
            matchPercentage: 50,
            matchedSkills: ["Error analyzing skills"],
            missingSkills: ["Error analyzing skills"],
            roadmap: "API error occurred. Please try again later to get a proper roadmap.",
            tips: ["Retry later when the API is available"]
        };
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file uploads and analysis
app.post('/analyze', (req, res) => {
    // Use multer middleware for file uploads
    upload.fields([
        { name: 'resume', maxCount: 1 },
        { name: 'jobDescription', maxCount: 1 }
    ])(req, res, async function (err) {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files || !req.files.resume || !req.files.jobDescription) {
                return res.status(400).json({ error: 'Both resume and job description are required' });
            }

            console.log('Files received:', req.files);

            // Get file paths
            const resumePath = req.files.resume[0].path;
            const jobDescriptionPath = req.files.jobDescription[0].path;

            // Extract text from files
            const resumeText = await extractText(resumePath);
            const jobDescriptionText = await extractText(jobDescriptionPath);

            // Log the extracted text length for debugging
            console.log(`Resume text length: ${resumeText.length} characters`);
            console.log(`Job description text length: ${jobDescriptionText.length} characters`);

            // Analyze the resume and job description using Gemini
            const analysisData = await analyzeResumeAndJob(resumeText, jobDescriptionText);

            // Send analysis results
            res.json(analysisData);

            // Clean up uploaded files after analysis
            setTimeout(() => {
                try {
                    fs.unlinkSync(resumePath);
                    fs.unlinkSync(jobDescriptionPath);
                } catch (err) {
                    console.error('Error removing temporary files:', err);
                }
            }, 1000);

        } catch (error) {
            console.error('Error during analysis:', error);
            res.status(500).json({
                error: 'An error occurred during analysis',
                details: error.message
            });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});