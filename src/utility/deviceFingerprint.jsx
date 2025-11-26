export async function getDeviceId() {
    try {
        const data = [
            navigator.userAgent,
            navigator.platform,
            navigator.language,
            screen.width,
            screen.height,
            screen.colorDepth,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
        ].join('|');

        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        // Fallback to a simple hash if crypto.subtle is not available
        let hash = 0;
        const data = navigator.userAgent + navigator.platform + Date.now().toString();
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
}
