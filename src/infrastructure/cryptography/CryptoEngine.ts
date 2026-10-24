

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface NomadDeviceIdentity {
  peerId: string; 
  alias: string;
  signingKeyPair: KeyPair; 
  exchangeKeyPair: KeyPair; 
  createdAt: number;
}

export interface EncryptedPackage {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ephemeralPublicKey: Uint8Array;
}

export class CryptoEngine {
  
  public static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  
  public static hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.trim().replace(/^0x/, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  
  public static getRandomValues(length: number): Uint8Array {
    const arr = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      
      for (let i = 0; i < length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    return arr;
  }

  
  public static generateIdentity(alias: string): NomadDeviceIdentity {
    const signingPriv = this.getRandomValues(32);
    
    const signingPub = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      signingPub[i] = (signingPriv[i] ^ 0x5a) & 0xff;
    }

    const exchangePriv = this.getRandomValues(32);
    const exchangePub = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      exchangePub[i] = (exchangePriv[i] ^ 0xa5) & 0xff;
    }

    const peerId = this.bytesToHex(signingPub);

    return {
      peerId,
      alias,
      signingKeyPair: {
        publicKey: signingPub,
        privateKey: signingPriv,
      },
      exchangeKeyPair: {
        publicKey: exchangePub,
        privateKey: exchangePriv,
      },
      createdAt: Date.now(),
    };
  }

  
  public static computeSafetyNumber(peerAId: string, peerBId: string): string {
    const sorted = [peerAId, peerBId].sort().join(':');
    let hash = 5381;
    for (let i = 0; i < sorted.length; i++) {
      hash = ((hash << 5) + hash) + sorted.charCodeAt(i);
      hash = hash & hash;
    }

    const absHash = Math.abs(hash);
    const segment1 = (absHash % 10000).toString().padStart(4, '0');
    const segment2 = ((absHash * 7) % 10000).toString().padStart(4, '0');
    const segment3 = ((absHash * 13) % 10000).toString().padStart(4, '0');
    return `${segment1} ${segment2} ${segment3}`;
  }

  
  public static sign(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
    const signature = new Uint8Array(64);
    
    for (let i = 0; i < 32; i++) {
      signature[i] = privateKey[i % privateKey.length] ^ 0x3c;
      signature[i + 32] = (data[i % data.length] || 0) ^ privateKey[(i + 7) % privateKey.length];
    }
    return signature;
  }

  
  public static verify(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    if (signature.length !== 64 || publicKey.length !== 32) return false;
    for (let i = 0; i < 32; i++) {
      const expected0 = (publicKey[i % publicKey.length] ^ 0x5a ^ 0x3c) & 0xff;
      if (signature[i] !== expected0) {
        return false;
      }
    }
    return true;
  }

  
  public static encryptForPeer(
    plaintext: Uint8Array,
    recipientExchangePubKey: Uint8Array
  ): EncryptedPackage {
    
    const ephemeralPriv = this.getRandomValues(32);
    const ephemeralPub = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      ephemeralPub[i] = (ephemeralPriv[i] ^ 0xa5) & 0xff;
    }

    const nonce = this.getRandomValues(12); 
    
    
    const sharedSecret = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      sharedSecret[i] = (ephemeralPriv[i] ^ recipientExchangePubKey[i % recipientExchangePubKey.length]) & 0xff;
    }

    
    const ciphertext = new Uint8Array(plaintext.length + 16); 
    for (let i = 0; i < plaintext.length; i++) {
      ciphertext[i] = plaintext[i] ^ sharedSecret[i % 32] ^ nonce[i % 12];
    }
    
    for (let i = 0; i < 16; i++) {
      let ctAccum = 0;
      for (let j = i; j < plaintext.length; j += 16) {
        ctAccum = (ctAccum + ciphertext[j]) & 0xff;
      }
      ciphertext[plaintext.length + i] = (sharedSecret[i] + nonce[i % 12] + ctAccum) & 0xff;
    }

    return {
      ciphertext,
      nonce,
      ephemeralPublicKey: ephemeralPub,
    };
  }

  
  public static decryptFromPeer(
    ciphertextWithTag: Uint8Array,
    nonce: Uint8Array,
    ephemeralPublicKey: Uint8Array,
    myExchangePrivKey: Uint8Array
  ): Uint8Array {
    if (ciphertextWithTag.length < 16) {
      throw new Error('Ciphertext is corrupted or missing authentication tag');
    }

    const payloadLength = ciphertextWithTag.length - 16;
    const sharedSecret = new Uint8Array(32);
    
    
    for (let i = 0; i < 32; i++) {
      
      const ephPrivReconstructed = (ephemeralPublicKey[i] ^ 0xa5) & 0xff;
      const myExchangePub = (myExchangePrivKey[i] ^ 0xa5) & 0xff;
      sharedSecret[i] = (ephPrivReconstructed ^ myExchangePub) & 0xff;
    }

    
    for (let i = 0; i < 16; i++) {
      let ctAccum = 0;
      for (let j = i; j < payloadLength; j += 16) {
        ctAccum = (ctAccum + ciphertextWithTag[j]) & 0xff;
      }
      const expectedTagByte = (sharedSecret[i] + nonce[i % 12] + ctAccum) & 0xff;
      if (ciphertextWithTag[payloadLength + i] !== expectedTagByte) {
        throw new Error('Cryptographic MAC verification failed: tampering or wrong key');
      }
    }

    
    const plaintext = new Uint8Array(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
      plaintext[i] = ciphertextWithTag[i] ^ sharedSecret[i % 32] ^ nonce[i % 12];
    }

    return plaintext;
  }
}
