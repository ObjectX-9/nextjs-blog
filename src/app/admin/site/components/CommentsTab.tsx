"use client";

import { Form, Switch, Input, Typography, Alert } from "antd";
import { EditableSite } from "../types";
import { ChangeEvent } from "react";

const { Text, Link } = Typography;

interface CommentsTabProps {
    editedSite: EditableSite;
    isEditing: boolean;
    handleInputChange: (field: string, value: any) => void;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({
    editedSite,
    isEditing,
    handleInputChange,
}) => {
    return (
        <Form layout="vertical" className="space-y-6">
            <Alert
                message="Giscus 配置说明"
                description={
                    <div>
                        <Text>
                            Giscus 是基于 GitHub Discussions 的评论系统。
                            <Link href="https://giscus.app/zh-CN" target="_blank">
                                {" "}点击这里获取配置信息
                            </Link>
                        </Text>
                    </div>
                }
                type="info"
                showIcon
                className="mb-4"
            />

            <Form.Item label="Giscus 评论">
                <div className="space-y-4">
                    <div>
                        <Switch
                            checked={editedSite.isOpenGiscus === true}
                            onChange={(checked) => handleInputChange("isOpenGiscus", checked)}
                            disabled={!isEditing}
                            className={!isEditing ? "cursor-not-allowed" : ""}
                        />
                        <span className="ml-2">启用 Giscus 评论</span>
                    </div>

                    {editedSite.isOpenGiscus && (
                        <div className="space-y-4 mt-4">
                            <Form.Item label="仓库名称 (repo)" className="mb-2">
                                <Input
                                    value={editedSite.giscusRepo}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange("giscusRepo", e.target.value)
                                    }
                                    disabled={!isEditing}
                                    placeholder="格式: owner/repo，如: ObjectX-9/nextjs-blog"
                                />
                            </Form.Item>

                            <Form.Item label="仓库 ID (repoId)" className="mb-2">
                                <Input
                                    value={editedSite.giscusRepoId}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange("giscusRepoId", e.target.value)
                                    }
                                    disabled={!isEditing}
                                    placeholder="如: R_kgDONPpElg"
                                />
                            </Form.Item>

                            <Form.Item label="分类名称 (category)" className="mb-2">
                                <Input
                                    value={editedSite.giscusCategory}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange("giscusCategory", e.target.value)
                                    }
                                    disabled={!isEditing}
                                    placeholder="如: Announcements"
                                />
                            </Form.Item>

                            <Form.Item label="分类 ID (categoryId)" className="mb-2">
                                <Input
                                    value={editedSite.giscusCategoryId}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange("giscusCategoryId", e.target.value)
                                    }
                                    disabled={!isEditing}
                                    placeholder="如: DIC_kwDONPpEls4C0B5L"
                                />
                            </Form.Item>
                        </div>
                    )}
                </div>
            </Form.Item>
        </Form>
    );
};
