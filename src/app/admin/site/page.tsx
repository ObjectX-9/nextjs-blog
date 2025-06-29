"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Tabs,
  Card,
  DatePicker,
  Typography,
  Statistic,
} from "antd";
import { format } from "date-fns";
import dayjs from "dayjs";
import { BasicInfoTab } from "./components/BasicInfoTab";
import { AuthorInfoTab } from "./components/AuthorInfoTab";
import { SeoSettingsTab } from "./components/SeoSettingsTab";
import { VerificationTab } from "./components/VerificationTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { ImageUpload } from "./components/ImageUpload";
import { useSiteManagement } from "./hooks/useSiteManagement";
import { api } from "./api";

export default function SiteManagementPage() {
  const {
    site,
    isEditing,
    editedSite,
    setEditedSite,
    contextHolder,
    fileState,
    captchas,
    isLoadingCaptchas,
    handleInputChange,
    handleFileSelect,
    handleSave,
    handleCancel,
    fetchAllCaptchas,
    setIsEditing,
    fetchSite,
  } = useSiteManagement();

  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  useEffect(() => {
    if (activeTab === "verification") {
      fetchAllCaptchas();
    }
  }, [activeTab, fetchAllCaptchas]);

  const renderImageUpload = (field: string, label: string, value: string) => (
    <ImageUpload
      field={field}
      label={label}
      value={value}
      isEditing={isEditing}
      fileState={fileState}
      handleInputChange={handleInputChange}
      handleFileSelect={handleFileSelect}
    />
  );

  const tabItems = useMemo(
    () => [
      {
        key: "basic",
        label: "基本信息",
        children: (
          <BasicInfoTab
            editedSite={editedSite}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            renderImageUpload={renderImageUpload}
          />
        ),
      },
      {
        key: "author",
        label: "作者信息",
        children: (
          <AuthorInfoTab
            editedSite={editedSite}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            renderImageUpload={renderImageUpload}
          />
        ),
      },
      {
        key: "seo",
        label: "SEO设置",
        children: (
          <SeoSettingsTab
            editedSite={editedSite}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
          />
        ),
      },
      {
        key: "verification",
        label: "验证设置",
        children: (
          <VerificationTab
            editedSite={editedSite}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            captchas={captchas}
            isLoadingCaptchas={isLoadingCaptchas}
            generateCaptcha={fetchAllCaptchas}
          />
        ),
      },
      {
        key: "analytics",
        label: "统计分析",
        children: (
          <AnalyticsTab
            editedSite={editedSite}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
          />
        ),
      },
    ],
    [
      editedSite,
      isEditing,
      handleInputChange,
      renderImageUpload,
      captchas,
      isLoadingCaptchas,
    ]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {contextHolder}

      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>网站信息管理</Typography.Title>
        <div>
          {!isEditing ? (
            <Button
              type="primary"
              onClick={() => {
                setIsEditing(true);
                setEditedSite((prev) => ({
                  ...prev,
                  isOpenVerifyArticle: prev.isOpenVerifyArticle === true,
                }));
              }}
            >
              编辑
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} className="mr-2">
                取消
              </Button>
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">访问人数</div>
              <Input
                type="number"
                value={editedSite.visitCount === null ? "" : editedSite.visitCount}
                onChange={(e) => handleInputChange("visitCount", e.target.value)}
              />
            </div>
          ) : (
            <Statistic title="访问人数" value={site.visitCount} />
          )}
        </Card>
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">点赞数</div>
              <Input
                type="number"
                value={editedSite.likeCount === null ? "" : editedSite.likeCount}
                onChange={(e) => handleInputChange("likeCount", e.target.value)}
              />
            </div>
          ) : (
            <Statistic title="点赞数" value={site.likeCount} />
          )}
        </Card>
        <Card>
          {isEditing ? (
            <div>
              <div className="text-sm text-gray-500 mb-1">创建时间</div>
              <DatePicker
                showTime
                value={dayjs(editedSite.createdAt)}
                onChange={(date) =>
                  handleInputChange("createdAt", date?.toDate() || new Date())
                }
              />
            </div>
          ) : (
            <Statistic
              title="创建时间"
              value={format(new Date(site.createdAt), "yyyy年MM月dd日")}
            />
          )}
        </Card>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}
