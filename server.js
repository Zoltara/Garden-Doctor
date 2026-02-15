import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ensure .tmp directory exists
const tmpDir = path.join(__dirname, '.tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.tmp/');
    },
    filename: (req, file, cb) => {
        cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Function to get the python command
const getPythonCommand = () => {
    if (process.env.PYTHON_PATH) return `"${process.env.PYTHON_PATH}"`;

    // Fallback for common Windows Store path if python command is blocked by alias
    const windowsStorePath = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WindowsApps/PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0/python.exe');
    if (fs.existsSync(windowsStorePath)) {
        return `"${windowsStorePath}"`;
    }

    return 'python'; // Default
};

app.post('/analyze', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = path.resolve(req.file.path);
    const pythonScript = path.resolve('execution', 'analyze_plant.py');
    const pythonCmd = getPythonCommand();
    const command = `${pythonCmd} "${pythonScript}" "${imagePath}"`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        // Clean up uploaded file
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        }

        if (error) {
            console.error(`Exec error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({
                error: 'Analysis failed',
                details: stderr,
                message: "Python command failed. Please ensure Python is installed and added to PATH, or set PYTHON_PATH in your .env file."
            });
        }

        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (parseError) {
            console.error(`Parse error: ${parseError}`);
            console.error(`Stdout: ${stdout}`);
            res.status(500).json({ error: 'Failed to parse analysis result', raw: stdout });
        }
    });
});

app.listen(port, () => {
    console.log(`Garden Doctor backend listening at http://localhost:${port}`);
});
