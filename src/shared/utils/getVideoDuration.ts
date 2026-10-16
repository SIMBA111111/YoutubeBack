import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);

export async function getVideoDuration(filePath: string): Promise<number> {
  // Используем ffprobe вместо ffmpeg
  const ffprobePath = `C:\\ffmpeg-2026-01-12-git-21a3e44fbe-full_build\\bin\\ffprobe.exe`;
  
  const { stdout } = await execAsync(
    `"${ffprobePath}" -v error -show_entries format=duration -of default=nw=1:nokey=1 "${filePath}"`
  );
  
  const duration = parseFloat(stdout.trim());
  if (isNaN(duration)) {
    throw new Error(`Не удалось получить длительность видео: ${stdout}`);
  }
  
  return duration;
}
