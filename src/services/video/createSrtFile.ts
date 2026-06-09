import { exec } from "child_process";
import path from "path";
import fs from 'fs'

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