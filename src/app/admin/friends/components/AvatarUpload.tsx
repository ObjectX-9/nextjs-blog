import { Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface AvatarUploadProps {
  imageUrl?: string;
  previewUrl?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  hasFile: boolean;
}

export const AvatarUpload = ({
  imageUrl,
  previewUrl,
  onFileSelect,
  onRemove,
  hasFile,
}: AvatarUploadProps) => {
  return (
    <>
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={(file) => {
          if (file.size > 10 * 1024 * 1024) {
            message.error("图片大小不能超过10MB");
            return Upload.LIST_IGNORE;
          }
          onFileSelect(file);
          return Upload.LIST_IGNORE;
        }}
        accept="image/png,image/jpeg,image/gif"
      >
        {(previewUrl || imageUrl) && (
          <Image
            src={previewUrl || imageUrl || ''}
            alt="Avatar preview"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
        )}
        {!hasFile && !imageUrl && (
          <div>
            <PlusOutlined />
            <div className="ant-upload-text">点击选择图片或拖拽到此处</div>
          </div>
        )}
      </Upload>
      {hasFile && (
        <Button
          type="link"
          onClick={onRemove}
          className="text-red-500 hover:text-red-600"
        >
          移除图片
        </Button>
      )}
    </>
  );
};
