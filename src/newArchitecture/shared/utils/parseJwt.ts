export const parseJwt = async (token: string) => {
    try {
        // Берем вторую часть (payload)
        const base64Url = token.split('.')[1];
        // Заменяем URL-safe символы на стандартные base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Декодируем base64 и парсим JSON
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Ошибка парсинга токена:', error);
        return null;
    }
}