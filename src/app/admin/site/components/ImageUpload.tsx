import { Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useEffect } from "react";
import { FileState } from "../types";

interface ImageUploadProps {
  field: string;
  label: string;
  value: string;
  isEditing: boolean;
  fileState: FileState;
  handleInputChange: (field: string, value: any) => void;
  handleFileSelect: (field: string, file: File) => void;
}

export const ImageUpload = ({
  field,
  label,
  value,
  isEditing,
  fileState,
  handleInputChange,
  handleFileSelect,
}: ImageUploadProps) => {
  // 获取预览URL，优先使用临时预览URL，如果没有则使用已保存的URL
  const previewUrl = fileState.previewUrls[field] || value;

  // 在组件卸载时清理预览URL
  useEffect(() => {
    return () => {
      const url = fileState.previewUrls[field];
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [field, fileState.previewUrls]);

  return (
    <Form.Item label={label} className="mb-4">
      <Input
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        disabled={!isEditing}
        className="mb-2"
      />
      {isEditing && (
        <Upload
          accept="image/*"
          beforeUpload={(file) => {
            console.log('Upload beforeUpload:', file);
            handleFileSelect(field, file);
            return false;
          }}
          showUploadList={false}
          maxCount={1}
        >
          <Button
            icon={<UploadOutlined />}
            disabled={fileState.isUploading[field]}
          >
            选择图片
          </Button>
        </Upload>
      )}
      {previewUrl && (
        <div className="mt-2">
          <Image
            src={previewUrl}
            alt={label}
            width={100}
            height={100}
            className="rounded border"
            priority={false}
            unoptimized={true}
          />
        </div>
      )}
    </Form.Item>
  );
};
