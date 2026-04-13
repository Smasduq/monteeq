import { useState, useCallback } from 'react';

const DB_NAME = 'MonteeqCryptoDB';
const STORE_NAME = 'Keys';
const KEY_NAME = 'ChatPrivateKey';

/**
 * Hook for End-to-End Encryption using Web Crypto API
 * Supports Hybrid Encryption (AES + RSA) for text, voice, and files.
 */
export const useCrypto = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const getDB = useCallback(() => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }, []);

    const savePrivateKey = useCallback(async (privateKey) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(privateKey, KEY_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }, [getDB]);

    const loadPrivateKey = useCallback(async () => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(KEY_NAME);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }, [getDB]);

    const generateKeyPair = useCallback(async () => {
        setIsGenerating(true);
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256',
                },
                true,
                ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
            );

            await savePrivateKey(keyPair.privateKey);

            const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublic)));

            return publicKeyBase64;
        } finally {
            setIsGenerating(false);
        }
    }, [savePrivateKey]);

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const encryptBinary = useCallback(async (data, recipientPublicKeyBase64, senderPublicKeyBase64) => {
        // 1. Generate AES-GCM Key
        const aesKey = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        // 2. Encrypt Content
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            aesKey,
            data
        );

        // 3. Import Public Keys
        const importKey = (base64) => {
            const bytes = base64ToArrayBuffer(base64);
            return window.crypto.subtle.importKey(
                'spki',
                bytes,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                true,
                ['wrapKey']
            );
        };

        const recipientKeyObj = await importKey(recipientPublicKeyBase64);
        const senderKeyObj = await importKey(senderPublicKeyBase64);

        // 4. Wrap AES Key for both
        const wrappedRecipient = await window.crypto.subtle.wrapKey(
            'raw',
            aesKey,
            recipientKeyObj,
            'RSA-OAEP'
        );
        const wrappedSender = await window.crypto.subtle.wrapKey(
            'raw',
            aesKey,
            senderKeyObj,
            'RSA-OAEP'
        );

        return {
            encrypted_content: arrayBufferToBase64(encryptedContent),
            iv: arrayBufferToBase64(iv),
            recipient_key: arrayBufferToBase64(wrappedRecipient),
            sender_key: arrayBufferToBase64(wrappedSender),
        };
    }, []);

    const encryptMessage = useCallback(async (text, recipientPublicKeyBase64, senderPublicKeyBase64) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        return encryptBinary(data, recipientPublicKeyBase64, senderPublicKeyBase64);
    }, [encryptBinary]);

    const decryptBinary = useCallback(async (encryptedContentB64, ivB64, wrappedKeyB64) => {
        const privateKey = await loadPrivateKey();
        if (!privateKey) throw new Error('Private key not found locally');

        const content = base64ToArrayBuffer(encryptedContentB64);
        const iv = base64ToArrayBuffer(ivB64);
        const wrappedKey = base64ToArrayBuffer(wrappedKeyB64);

        // 1. Unwrap AES Key
        const aesKey = await window.crypto.subtle.unwrapKey(
            'raw',
            wrappedKey,
            privateKey,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt']
        );

        // 2. Decrypt Content
        return await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            aesKey,
            content
        );
    }, [loadPrivateKey]);

    const decryptMessage = useCallback(async (encryptedContentB64, ivB64, wrappedKeyB64) => {
        const decryptedBuffer = await decryptBinary(encryptedContentB64, ivB64, wrappedKeyB64);
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }, [decryptBinary]);

    const exportPrivateKey = useCallback(async () => {
        const privateKey = await loadPrivateKey();
        if (!privateKey) return null;
        const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
        return arrayBufferToBase64(exported);
    }, [loadPrivateKey]);

    const importPrivateKey = useCallback(async (base64Key) => {
        const bytes = base64ToArrayBuffer(base64Key);
        const privateKey = await window.crypto.subtle.importKey(
            'pkcs8',
            bytes,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['decrypt', 'unwrapKey']
        );
        await savePrivateKey(privateKey);
    }, [savePrivateKey]);

    return {
        generateKeyPair,
        encryptMessage,
        decryptMessage,
        encryptBinary,
        decryptBinary,
        exportPrivateKey,
        importPrivateKey,
        isGenerating,
        hasLocalKey: async () => !!(await loadPrivateKey()),
    };
};
