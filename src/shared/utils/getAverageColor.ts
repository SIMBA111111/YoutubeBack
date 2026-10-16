import sharp from 'sharp';

export const getAverageColor = async (imagePath: string) => {
  try {
    // Читаем изображение и получаем пиксельные данные
    const { data, info } = await sharp(imagePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // data - это Buffer с RGB значениями
    const pixels = data;
    const totalPixels = info.width * info.height;
    
    let r = 0, g = 0, b = 0;
    
    // Суммируем все значения каналов
    for (let i = 0; i < pixels.length; i += 3) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }
    
    // Вычисляем средние значения
    const avgR = Math.round(r / totalPixels);
    const avgG = Math.round(g / totalPixels);
    const avgB = Math.round(b / totalPixels);
    
    return {
      rgb: [avgR, avgG, avgB],
      hex: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`
    };
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
}