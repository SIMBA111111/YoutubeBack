import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);

export async function getVideoDuration(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffprobe.exe -v error -show_entries format=duration -of default=nw=1:nokey=1 "${filePath}"`
  );
  return parseFloat(stdout.trim());
}
