import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import os from "os";

function saveTempFile(file) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sankalp-"));
  const ext = path.extname(file.originalname || ".png") || ".png";
  const p = path.join(tmpDir, "upload" + ext);
  fs.writeFileSync(p, file.buffer);
  return p;
}

export const extractPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "file is required (multipart/form-data, field: file)" });
    }

    const imagePath = saveTempFile(req.file);

    const py = spawn(process.env.PYTHON_PATH || "python", [
      "src/ml/test_server_pythonic.py",
      imagePath
    ], {
      cwd: path.resolve(process.cwd(), "."),
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_V1 || ""
      }
    });

    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));

    py.on("close", (code) => {
      try {
        if (code !== 0) {
          return res.status(500).json({ success: false, error: "Python exit code " + code, stderr });
        }
        const parsed = JSON.parse(stdout);
        return res.json({ success: true, medicines: parsed });
      } catch (e) {
        return res.status(500).json({ success: false, error: "Invalid ML output", details: e.message, stderr, stdout });
      } finally {
        try { fs.unlinkSync(imagePath); } catch {}
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
