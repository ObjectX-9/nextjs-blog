"use client";

import { Form, Switch, Input } from "antd";
import { EditableSite } from "../types";

interface AnalyticsTabProps {
  editedSite: EditableSite;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  editedSite,
  isEditing,
  handleInputChange,
}) => {
  return (
    <Form layout="vertical" className="space-y-6">
      <Form.Item label="Google Tag Manager">
        <div className="space-y-4">
          <div>
            <Switch
              checked={editedSite.isOpenGtm === true}
              onChange={(checked) => handleInputChange("isOpenGtm", checked)}
              disabled={!isEditing}
              className={!isEditing ? "cursor-not-allowed" : ""}
            />
            <span className="ml-2">启用 Google Tag Manager</span>
          </div>
          {editedSite.isOpenGtm && (
            <Input
              value={editedSite.googleTagManagerId}
              onChange={(e) =>
                handleInputChange("googleTagManagerId", e.target.value)
              }
              disabled={!isEditing}
              placeholder="请输入 GTM ID，格式如：GTM-XXXXXXX"
            />
          )}
        </div>
      </Form.Item>

      <Form.Item label="Google AdSense">
        <div className="space-y-4">
          <div>
            <Switch
              checked={editedSite.isOpenAdsense === true}
              onChange={(checked) => handleInputChange("isOpenAdsense", checked)}
              disabled={!isEditing}
              className={!isEditing ? "cursor-not-allowed" : ""}
            />
            <span className="ml-2">启用 Google AdSense</span>
          </div>
          {editedSite.isOpenAdsense && (
            <Input
              value={editedSite.googleAdsenseId}
              onChange={(e) =>
                handleInputChange("googleAdsenseId", e.target.value)
              }
              disabled={!isEditing}
              placeholder="请输入 AdSense ID，格式如：6315396465673433"
            />
          )}
        </div>
      </Form.Item>
    </Form>
  );
};
