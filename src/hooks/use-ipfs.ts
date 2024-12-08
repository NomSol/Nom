// src/hooks/use-ipfs.ts
import { useState } from 'react';
import { IPFSService } from '@/lib/ipfs-service';

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const ipfs = IPFSService.getInstance();

  const uploadTreasure = async (
    imageFile: File,
    data: {
      name: string;
      description: string;
      points: number;
      hint: string;
      latitude: number;
      longitude: number;
    }
  ) => {
    setIsUploading(true);
    console.log('IPFS upload started with file:', imageFile.name);

    try {
      // 1. 上传图片
      console.log('Uploading image to IPFS...');
      const imageCid = await ipfs.uploadFile(imageFile);
      const imageUrl = ipfs.getIpfsUrl(imageCid);
      console.log('Image uploaded to IPFS:', { imageCid, imageUrl });

      // 2. 上传元数据
      console.log('Uploading metadata to IPFS...');
      const metadataCid = await ipfs.uploadMetadata({
        name: data.name,
        description: data.description,
        image: `ipfs://${imageCid}`,
        attributes: {
          points: data.points,
          hint: data.hint,
          latitude: data.latitude,
          longitude: data.longitude
        }
      });
      console.log('Metadata uploaded to IPFS:', metadataCid);

      return {
        imageCid,
        metadataCid,
        imageUrl,
        metadataUrl: ipfs.getIpfsUrl(metadataCid)
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadTreasure,
    isUploading,
    getIpfsUrl: ipfs.getIpfsUrl
  };
}