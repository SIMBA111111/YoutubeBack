import { exec } from "child_process";
import util from "util";
import path from "path";
import fs from 'fs'
import { videoCreatingConnections } from "../video.routes";
import { TSendProgressDto } from "./video.dtos";

const execAsync = util.promisify(exec);

export async function getVideoDuration(filePath: string): Promise<number> {
  // Используем ffprobe вместо ffmpeg
  const ffprobePath = `D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffprobe.exe`;
  
  const { stdout } = await execAsync(
    `"${ffprobePath}" -v error -show_entries format=duration -of default=nw=1:nokey=1 "${filePath}"`
  );
  
  const duration = parseFloat(stdout.trim());
  if (isNaN(duration)) {
    throw new Error(`Не удалось получить длительность видео: ${stdout}`);
  }
  
  return duration;
}


export const createSrtSubtitleFile = async (videoIdDir: string, absoluteVideoPath: string, mp4VideoFilename: string): Promise<string> => {
    const whisperExePath = "C:\\Users\\user\\Downloads\\Faster-Whisper-XXL_r245.4_windows\\Faster-Whisper-XXL\\faster-whisper-xxl.exe";
    const outputDir = path.join(videoIdDir, "subtitles");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const cmd = `"${whisperExePath}" "${absoluteVideoPath}" --device cpu --language Russian --model small --output_dir "${outputDir}"`;

    console.log('старт генерации субтитров');
    
    // Оборачиваем exec в Promise
    await new Promise<void>((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("faster-whisper error:", error);
                console.error("stderr:", stderr);
                return reject(error);
            }
            console.log("faster-whisper stdout:", stdout);
            console.log("Субтитры сохранены в:", outputDir);
            resolve();
        });
    });

    // Ищем созданный SRT файл
    const files = fs.readdirSync(outputDir);
    const srtFiles = files.filter(file => file.endsWith('.srt'));
    
    console.log('Найденные SRT файлы:', srtFiles);
    
    if (srtFiles.length === 0) {
        throw new Error('SRT файл не был создан');
    }
    
    // Берём первый найденный SRT файл
    const srtFileName = srtFiles[0];
    const srtFilePath = path.join(outputDir, srtFileName);
    
    // Проверяем размер файла
    const stats = fs.statSync(srtFilePath);
    console.log(`SRT файл создан: ${srtFileName}, размер: ${stats.size} байт`);
    
    // if (stats.size === 0) {
    //     throw new Error('SRT файл пустой');
    // }
    
    return srtFilePath;
}



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
    const stats = await fs.promises.stat(srtFilePath);
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
    await fs.promises.writeFile(vttPath, emptyVttContent, "utf8");
    console.log("Создан пустой VTT файл:", vttPath);
  } else {
    // Конвертируем SRT → VTT через ffmpeg
    // путь к экзешнику дома - D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffmpeg.exe 
    // путь к экзешнику на работе - C:\\ffmpeg-2026-01-12-git-21a3e44fbe-full_build\\bin\\ffprobe.exe
    const cmd = `C:\\ffmpeg-2026-01-12-git-21a3e44fbe-full_build\\bin\\ffmpeg.exe -i "${srtFilePath}" "${vttPath}"`;

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
  await fs.promises.writeFile(m3u8Path, m3u8Content, "utf8");

  console.log("Субтитры сохранены в:", vttPath);
  console.log("M3U8 плейлист создан:", m3u8Path);

  return { m3u8Path, vttPath };
};


export const sendProgress = async (userId: string, data: TSendProgressDto) => {
    const conn = videoCreatingConnections.get(userId);
    
    console.log(`Отправка прогресса для ${userId}:`, data.progress);
    console.log(`Соединение существует:`, !!conn);
    
    if (conn) {
        // ✅ Правильно: conn это сам Response объект
        if (!conn.writableEnded && !conn.destroyed) {
            try {
                conn.write(`data: ${JSON.stringify(data)}\n\n`);
                console.log(`✅ Прогресс отправлен: ${data.progress}%`);
            } catch (error) {
                console.error(`Ошибка при отправке:`, error);
                videoCreatingConnections.delete(userId);
            }
        } else {
            console.log(`❌ Соединение уже закрыто для ${userId}`);
            videoCreatingConnections.delete(userId);
        }
    } else {
        console.log(`❌ Нет соединения для ${userId}`);
        console.log('Доступные соединения:', Array.from(videoCreatingConnections.keys()));
    }
}