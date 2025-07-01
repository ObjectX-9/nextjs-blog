"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  message,
} from "antd";

import { MarkdownEditor } from "@/components/customMdRender/components/MarkdownEditor";
import "@/styles/markdown.css";
import { projectRequirementsBusiness } from "@/app/business/project-requirements";
import { IProjectRequirements } from "@/app/model/project-requirements";

const { Header, Content } = Layout;

const EditTechSolution = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [requirement, setRequirement] = useState<IProjectRequirements | null>(null);
  const [initialContentState, setInitialContentState] = useState("");

  // 获取项目需求和技术方案内容
  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        setLoading(true);
        const response = await projectRequirementsBusiness.getProjectRequirement(params.id);
        setRequirement(response);

        // 如果已有技术方案文件，获取内容
        if (response.techSolutionOssPath) {
          try {
            const contentResponse = await fetch(`/api/proxy-content?url=${encodeURIComponent(response.techSolutionOssPath)}`);
            if (contentResponse.ok) {
              const contentText = await contentResponse.text();
              setInitialContentState(contentText);
              setContent(contentText);
            }
          } catch (error) {
            console.error("获取技术方案内容失败:", error);
            // 如果获取失败，使用空内容
            setInitialContentState("");
            setContent("");
          }
        } else {
          setInitialContentState("");
          setContent("");
        }
      } catch (error) {
        console.error("获取项目需求失败:", error);
        message.error("获取项目需求失败");
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [params.id]);

  // 保存技术方案
  const handleSave = useCallback(async () => {
    if (!requirement) {
      message.error("项目需求信息不完整");
      return;
    }

    try {
      setLoading(true);

      // 1. 上传 Markdown 内容到 OSS
      const markdownBlob = new Blob([content], {
        type: "text/markdown; charset=UTF-8",
      });
      const formData = new FormData();
      formData.append("file", markdownBlob, `tech-solution-${requirement._id}-${Date.now()}.md`);
      formData.append("type", "tech");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(
          error.error || `上传文件失败: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 更新项目需求的技术方案路径
      await projectRequirementsBusiness.updateProjectRequirement(params.id, {
        techSolutionOssPath: ossPath,
      });

      message.success("技术方案保存成功");

      // 保存成功后返回
      router.push("/project-requirements");
    } catch (error) {
      console.error("保存失败:", error);
      message.error(error instanceof Error ? error.message : "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [content, requirement, params.id, router]);

  if (!requirement) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            技术方案详情
          </h1>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600 truncate max-w-md" title={requirement.title}>
              {requirement.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            onClick={() => router.push("/project-requirements")}
            size="middle"
            className="border-gray-300 hover:border-gray-400"
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            size="middle"
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 min-h-0 relative">
        {loading && !content ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-2 text-gray-600">正在加载内容...</div>
            </div>
          </div>
        ) : (
          <MarkdownEditor
            initialContent={initialContentState}
            onChange={(value) => setContent(value)}
            showToc={true}
            documentTheme="github"
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default EditTechSolution; 