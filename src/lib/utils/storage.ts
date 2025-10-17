import { promises as fs } from "fs";
import path from "path";

/**
 * Storage utilities for persisting form submissions
 * For MVP: Uses JSON files. For production: Consider database integration
 */

const DATA_DIR = path.join(process.cwd(), "data");

export interface StoredSubmission {
  id: string;
  timestamp: string;
  data: Record<string, unknown>;
  ip?: string;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Store a submission to a JSON file
 */
export async function storeSubmission(
  fileName: string,
  data: Record<string, unknown>,
  ip?: string
): Promise<void> {
  await ensureDataDir();

  const filePath = path.join(DATA_DIR, fileName);
  const submission: StoredSubmission = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    data,
    ip,
  };

  // Read existing data
  let existingData: StoredSubmission[] = [];
  try {
    const content = await fs.readFile(filePath, "utf-8");
    existingData = JSON.parse(content);
  } catch {
    // File doesn't exist or is invalid, start fresh
  }

  // Append new submission
  existingData.push(submission);

  // Write back to file
  await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf-8");
}

/**
 * Generate a unique ID for submissions
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Read all submissions from a file
 */
export async function readSubmissions(
  fileName: string
): Promise<StoredSubmission[]> {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}
