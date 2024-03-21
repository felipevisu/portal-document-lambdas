import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

interface S3UploadProps {
  bucketName: string;
  key: string;
  file: Buffer;
}

export const s3Upload = async ({ bucketName, key, file }: S3UploadProps) => {
  const params: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: file,
  };

  const s3Client = new S3Client({});
  await s3Client.send(new PutObjectCommand(params));
};
