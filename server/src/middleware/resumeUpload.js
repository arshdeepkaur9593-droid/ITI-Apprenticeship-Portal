import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const serverDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
export const getResumeStorageDirectory = () =>
  path.resolve(
    process.env.RESUME_STORAGE_DIR ||
      path.join(serverDirectory, "private", "resumes")
  );

export const getResumePath = (storageKey) => {
  if (
    typeof storageKey !== "string" ||
    !/^[0-9a-f-]{36}\.(pdf|docx)$/i.test(storageKey)
  ) {
    throw new Error("Invalid stored resume reference");
  }

  return path.join(getResumeStorageDirectory(), storageKey);
};

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const directory = getResumeStorageDirectory();
    fs.mkdir(directory, { recursive: true })
      .then(() => callback(null, directory))
      .catch(callback);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 0,
  },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx"].includes(extension)) {
      const error = new Error("Only PDF and DOCX files are allowed");
      error.status = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

export const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge
          ? "Resume must be 5 MB or smaller"
          : "Upload one resume file using the resume field",
      });
      return;
    }

    res.status(error.status === 400 ? 400 : 500).json({
      success: false,
      message:
        error.status === 400
          ? error.message
          : "Resume upload could not be processed",
    });
  });
};

export const isValidResumeFile = async (filePath, extension) => {
  const file = await fs.readFile(filePath);

  if (extension === ".pdf") {
    return file.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (
    extension !== ".docx" ||
    file.length < 22 ||
    file.readUInt32LE(0) !== 0x04034b50
  ) {
    return false;
  }

  const minimumEndOffset = Math.max(0, file.length - 22 - 0xffff);
  let endRecordOffset = -1;
  for (let offset = file.length - 22; offset >= minimumEndOffset; offset -= 1) {
    if (file.readUInt32LE(offset) === 0x06054b50) {
      endRecordOffset = offset;
      break;
    }
  }

  if (endRecordOffset < 0) return false;

  const entryCount = file.readUInt16LE(endRecordOffset + 10);
  const directoryOffset = file.readUInt32LE(endRecordOffset + 16);
  const requiredEntries = new Set([
    "[Content_Types].xml",
    "word/document.xml",
  ]);
  let offset = directoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (
      offset + 46 > file.length ||
      file.readUInt32LE(offset) !== 0x02014b50
    ) {
      return false;
    }

    const nameLength = file.readUInt16LE(offset + 28);
    const extraLength = file.readUInt16LE(offset + 30);
    const commentLength = file.readUInt16LE(offset + 32);
    const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (entryEnd > file.length) return false;

    const entryName = file
      .subarray(offset + 46, offset + 46 + nameLength)
      .toString("utf8");
    requiredEntries.delete(entryName);
    offset = entryEnd;
  }

  return requiredEntries.size === 0;
};

export const removeResumeFile = async (storageKey) => {
  if (storageKey) {
    await fs.rm(getResumePath(storageKey), { force: true });
  }
};
