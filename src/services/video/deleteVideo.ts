import fs from 'fs/promises';

export const deleteVideoService = async (videoId: string) => {
    const cwd = process.cwd();
    const folderPath = cwd + '/public/videos/' + videoId
    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`✅ Папка ${folderPath} и всё её содержимое удалены`);
        return true;
    } catch (error: any) {
        console.error(`Ошибка при удалении ${folderPath}:`, error.message);
        return false;
    }
};