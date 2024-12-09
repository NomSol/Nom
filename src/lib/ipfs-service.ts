// src/lib/ipfs-service.ts
import { NFTStorage, File } from 'nft.storage';

export class IPFSService {
  private client: NFTStorage;
  private static instance: IPFSService;

  private constructor() {
    const token = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;
    
    if (!token) {
      throw new Error('NFT.Storage token missing');
    }

    this.client = new NFTStorage({ token });
  }

  public static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const blobData = new Blob([file]);
      const cid = await this.client.storeBlob(blobData);
      console.log('File uploaded to IPFS:', cid);
      return cid;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadMetadata(metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      points: number;
      hint: string;
      latitude: number;
      longitude: number;
    };
  }): Promise<string> {
    try {
      const data = await this.client.store({
        name: metadata.name,
        description: metadata.description,
        image: new File(
          [await fetch(metadata.image).then(r => r.blob())],
          'image.png',
          { type: 'image/png' }
        ),
        properties: metadata.attributes
      });
      
      console.log('Metadata uploaded to IPFS:', data.url);
      return data.url.replace('ipfs://', '');
    } catch (error) {
      console.error('Metadata upload failed:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  getIpfsUrl(cid: string): string {
    return `https://nftstorage.link/ipfs/${cid}`;
  }
}