"use client";

import { Form, Input } from "antd";
import { EditableSite } from "../types";

interface BasicInfoTabProps {
  editedSite: EditableSite;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
  renderImageUpload: (field: string, label: string, value: string) => JSX.Element;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  editedSite,
  isEditing,
  handleInputChange,
  renderImageUpload,
}) => {
  return (
    <Form layout="vertical" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item label="网站标题">
          <Input
            value={editedSite.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={!isEditing}
          />
        </Form.Item>
        {renderImageUpload("favicon", "网站图标", editedSite.favicon)}
      </div>

      <Form.Item label="网站描述">
        <Input.TextArea
          value={editedSite.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          disabled={!isEditing}
          rows={4}
        />
      </Form.Item>

      {renderImageUpload("backgroundImage", "首页背景图", editedSite.backgroundImage)}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderImageUpload("workspaceBgUrl1", "工作室背景图1", editedSite.workspaceBgUrl1 || "")}
        {renderImageUpload("workspaceBgUrl2", "工作室背景图2", editedSite.workspaceBgUrl2 || "")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderImageUpload("qrcode", "二维码", editedSite.qrcode)}
        {renderImageUpload("appreciationCode", "赞赏码", editedSite.appreciationCode)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderImageUpload("wechatGroup", "微信公众号图片", editedSite.wechatGroup)}
        <Form.Item label="微信公众号名称">
          <Input
            value={editedSite.wechatGroupName || ""}
            onChange={(e) => handleInputChange("wechatGroupName", e.target.value)}
            disabled={!isEditing}
            placeholder="请输入微信公众号名称"
          />
        </Form.Item>
        <Form.Item label="微信公众号关键词">
          <Input
            value={editedSite.wechatKeyword || ""}
            onChange={(e) => handleInputChange("wechatKeyword", e.target.value)}
            disabled={!isEditing}
            placeholder="请输入微信公众号关键词"
          />
        </Form.Item>
        <Form.Item label="ICP备案号">
          <Input
            value={editedSite.icp || ""}
            onChange={(e) => handleInputChange("icp", e.target.value)}
            disabled={!isEditing}
          />
        </Form.Item>
      </div>
    </Form>
  );
};
