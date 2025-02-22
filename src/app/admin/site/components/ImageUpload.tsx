import { Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
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
          beforeUpload={(file) => {
            handleFileSelect(field, file);
            return false;
          }}
          showUploadList={false}
        >
          <Button
            icon={<UploadOutlined />}
            disabled={fileState.isUploading[field]}
          >
            选择图片
          </Button>
        </Upload>
      )}
      {value && (
        <div className="mt-2">
          <Image
            src={value}
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
