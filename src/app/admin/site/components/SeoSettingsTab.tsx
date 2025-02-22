"use client";

import { Form, Input } from "antd";
import { EditableSite } from "../types";

interface SeoSettingsTabProps {
  editedSite: EditableSite;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
}

export const SeoSettingsTab: React.FC<SeoSettingsTabProps> = ({
  editedSite,
  isEditing,
  handleInputChange,
}) => {
  return (
    <Form layout="vertical" className="space-y-6">
      <Form.Item label="SEO关键词">
        <Input
          value={
            Array.isArray(editedSite.seo?.keywords)
              ? editedSite.seo.keywords.join(",")
              : ""
          }
          onChange={(e) =>
            handleInputChange("seo.keywords", e.target.value.split(","))
          }
          disabled={!isEditing}
          placeholder="用逗号分隔多个关键词"
        />
      </Form.Item>

      <Form.Item label="SEO描述">
        <Input.TextArea
          value={editedSite.seo?.description}
          onChange={(e) => handleInputChange("seo.description", e.target.value)}
          disabled={!isEditing}
          rows={4}
        />
      </Form.Item>
    </Form>
  );
};
