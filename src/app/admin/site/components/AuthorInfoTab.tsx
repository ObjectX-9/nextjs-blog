"use client";

import { Form, Input } from "antd";
import { EditableSite } from "../types";

interface AuthorInfoTabProps {
  editedSite: EditableSite;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
  renderImageUpload: (field: string, label: string, value: string) => JSX.Element;
}

export const AuthorInfoTab: React.FC<AuthorInfoTabProps> = ({
  editedSite,
  isEditing,
  handleInputChange,
  renderImageUpload,
}) => {
  return (
    <Form layout="vertical" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item label="作者名称">
          <Input
            value={editedSite.author?.name}
            onChange={(e) => handleInputChange("author.name", e.target.value)}
            disabled={!isEditing}
          />
        </Form.Item>
        {renderImageUpload("author.avatar", "作者头像", editedSite.author?.avatar || "")}
      </div>

      <Form.Item label="作者简介">
        <Input.TextArea
          value={editedSite.author?.bio}
          onChange={(e) => handleInputChange("author.bio", e.target.value)}
          disabled={!isEditing}
          rows={2}
        />
      </Form.Item>

      <Form.Item label="作者描述">
        <Input.TextArea
          value={editedSite.author?.description}
          onChange={(e) => handleInputChange("author.description", e.target.value)}
          disabled={!isEditing}
          rows={4}
        />
      </Form.Item>
    </Form>
  );
};
