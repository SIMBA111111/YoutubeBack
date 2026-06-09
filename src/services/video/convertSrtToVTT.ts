import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

export const convertSrtToVTTAndCreateM3U8 = async (
  srtFilePath: string,
  playlistDir: string
): Promise<{ m3u8Path: string; vttPath: string }> => {
  const srtBasename = path.basename(srtFilePath, ".srt");
  const vttFilename = `${srtBasename}.vtt`;
  const vttPath = path.join(playlistDir, vttFilename);

  // Проверяем, существует ли файл и не пустой ли он
  let isSrtEmpty = false;
  try {
    const stats = await fs.stat(srtFilePath);
    if (stats.size === 0) {
      isSrtEmpty = true;
      console.warn(`SRT файл пуст: ${srtFilePath}, будет создан пустой VTT файл`);
    }
  } catch (error) {
    console.error(`Ошибка при проверке SRT файла: ${srtFilePath}`, error);
    throw new Error(`Не удалось прочитать SRT файл: ${srtFilePath}`);
  }

  // Если SRT пустой - создаем пустой VTT файл напрямую
  if (isSrtEmpty) {
    // Создаем пустой VTT файл с минимальным содержимым (для валидности)
    const emptyVttContent = "WEBVTT\n\n";
    await fs.writeFile(vttPath, emptyVttContent, "utf8");
    console.log("Создан пустой VTT файл:", vttPath);
  } else {
    // Конвертируем SRT → VTT через ffmpeg
    const cmd = `D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffmpeg.exe -i "${srtFilePath}" "${vttPath}"`;

    await new Promise<void>((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error("ffmpeg error (SRT → VTT):", error);
          console.error("stderr:", stderr);
          return reject(error);
        }
        console.log("ffmpeg stdout:", stdout);
        resolve();
      });
    });
  }

  // Генерируем subs.m3u8 (даже для пустых субтитров)
  const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:4,
${vttFilename}
#EXT-X-ENDLIST
`;

  const m3u8Path = path.join(playlistDir, "subs.m3u8");
  await fs.writeFile(m3u8Path, m3u8Content, "utf8");

  console.log("Субтитры сохранены в:", vttPath);
  console.log("M3U8 плейлист создан:", m3u8Path);

  return { m3u8Path, vttPath };
};