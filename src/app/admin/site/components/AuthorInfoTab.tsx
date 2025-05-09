"use client";

import { Form, Input, Button, Space, Card, DatePicker, Select } from "antd";
import { EditableSite } from "../types";
import { IEducation } from "@/app/model/education";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

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
  // 添加新的教育经历
  const handleAddEducation = () => {
    const newEducation: IEducation = {
      school: "",
      major: "",
      degree: "学士",
      certifications: [],
      startDate: "",
      endDate: ""
    };
    
    const updatedEducation = editedSite.author?.education ? 
      [...editedSite.author.education, newEducation] : 
      [newEducation];
    
    handleInputChange("author.education", updatedEducation);
  };
  
  // 删除教育经历
  const handleRemoveEducation = (index: number) => {
    if (!editedSite.author?.education) return;
    
    const updatedEducation = [...editedSite.author.education];
    updatedEducation.splice(index, 1);
    
    handleInputChange("author.education", updatedEducation);
  };
  
  // 更新教育经历字段
  const handleEducationChange = (index: number, field: keyof IEducation, value: any) => {
    if (!editedSite.author?.education) return;
    
    const updatedEducation = [...editedSite.author.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    handleInputChange("author.education", updatedEducation);
  };
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
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">教育经历</h3>
          {isEditing && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddEducation}
            >
              添加教育经历
            </Button>
          )}
        </div>
        
        {editedSite.author?.education && editedSite.author.education.length > 0 ? (
          <div className="space-y-4">
            {editedSite.author.education.map((edu, index) => (
              <Card 
                key={index} 
                className="bg-gray-50" 
                extra={isEditing && (
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleRemoveEducation(index)}
                  />
                )}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="学校名称" className="mb-2">
                    <Input
                      value={edu.school}
                      onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                      disabled={!isEditing}
                    />
                  </Form.Item>
                  <Form.Item label="专业" className="mb-2">
                    <Input
                      value={edu.major}
                      onChange={(e) => handleEducationChange(index, "major", e.target.value)}
                      disabled={!isEditing}
                    />
                  </Form.Item>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="学位" className="mb-2">
                    <Select
                      value={edu.degree}
                      onChange={(value) => handleEducationChange(index, "degree", value)}
                      disabled={!isEditing}
                      options={[
                        { value: "学士", label: "学士" },
                        { value: "硕士", label: "硕士" },
                        { value: "博士", label: "博士" },
                        { value: "其他", label: "其他" }
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="证书" className="mb-2">
                    <Select
                      mode="tags"
                      value={edu.certifications || []}
                      onChange={(value) => handleEducationChange(index, "certifications", value)}
                      disabled={!isEditing}
                      placeholder="输入证书名称后按回车"
                    />
                  </Form.Item>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="入学时间" className="mb-2">
                    <DatePicker
                      value={edu.startDate ? dayjs(edu.startDate) : null}
                      onChange={(date) => handleEducationChange(index, "startDate", date ? date.format("YYYY-MM") : "")}
                      disabled={!isEditing}
                      picker="month"
                      placeholder="选择入学时间"
                      format="YYYY-MM"
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item label="毕业时间" className="mb-2">
                    <DatePicker
                      value={edu.endDate ? dayjs(edu.endDate) : null}
                      onChange={(date) => handleEducationChange(index, "endDate", date ? date.format("YYYY-MM") : "")}
                      disabled={!isEditing}
                      picker="month"
                      placeholder="选择毕业时间"
                      format="YYYY-MM"
                      className="w-full"
                    />
                  </Form.Item>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">暂无教育经历信息</p>
            {isEditing && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddEducation}
                className="mt-4"
              >
                添加教育经历
              </Button>
            )}
          </div>
        )}
      </div>
    </Form>
  );
};
