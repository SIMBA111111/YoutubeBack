// shared/utils/http-params.ts

/**
 * Безопасно извлекает число из query/params
 * Поддерживает string, string[], ParsedQs, и любые другие типы
 */
export function getNumberParam(
    param: unknown, // 👈 Меняем на unknown
    defaultValue: number = 0
): number {
    if (!param) return defaultValue;

    // Если массив - берем первый элемент
    if (Array.isArray(param)) {
        const first = param[0];
        if (!first) return defaultValue;
        const str = typeof first === 'object' ? JSON.stringify(first) : String(first);
        const num = Number(str);
        return isNaN(num) ? defaultValue : num;
    }

    // Если объект (ParsedQs) - игнорируем
    if (typeof param === 'object') {
        return defaultValue;
    }

    // Если строка или число
    const str = String(param);
    const num = Number(str);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Безопасно извлекает строку из query/params
 */
export function getStringParam(
    param: unknown, // 👈 Меняем на unknown
    defaultValue: string = ''
): string {
    if (!param) return defaultValue;

    // Если массив - берем первый элемент
    if (Array.isArray(param)) {
        const first = param[0];
        if (!first) return defaultValue;
        return typeof first === 'object' ? JSON.stringify(first) : String(first);
    }

    // Если объект (ParsedQs) - превращаем в строку или возвращаем дефолт
    if (typeof param === 'object') {
        return defaultValue;
    }

    // Если строка или число
    return String(param);
}

/**
 * Безопасно извлекает boolean из query/params
 */
export function getBooleanParam(
    param: unknown, // 👈 Меняем на unknown
    defaultValue: boolean = false
): boolean {
    if (!param) return defaultValue;

    // Если массив - берем первый элемент
    if (Array.isArray(param)) {
        const first = param[0];
        if (!first) return defaultValue;
        const str = typeof first === 'object' ? JSON.stringify(first) : String(first);
        return str === 'true' || str === '1';
    }

    // Если объект (ParsedQs) - игнорируем
    if (typeof param === 'object') {
        return defaultValue;
    }

    const str = String(param);
    return str === 'true' || str === '1';
}