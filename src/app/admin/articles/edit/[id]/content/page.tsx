"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Layout,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
} from "antd";

import { ArticleStatus, ArticleCountByCategory } from "@/app/model/article";
import "@/styles/markdown.css";

const MarkdownEditor = dynamic(
  () => import('@/components/customMdRender/components/MarkdownEditor').then(mod => ({ default: mod.MarkdownEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-2 text-gray-600">正在加载编辑器...</div>
        </div>
      </div>
    )
  }
);
import { articlesService } from "@/app/business/articles";

const { Header, Content } = Layout;

const EditArticleContent = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [categories, setCategories] = useState<ArticleCountByCategory[]>([]);
  const [articleSettings, setArticleSettings] = useState({
    title: "",
    categoryId: "",
    status: ArticleStatus.DRAFT,
  });
  const [initialContentState, setInitialContentState] = useState("");

  // 获取文章内容
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await articlesService.getArticle(params.id);
        const articleContent = response.content || "";
        setInitialContentState(articleContent);
        setContent(articleContent);

        // 设置文章其他信息
        const settings = {
          title: response.title || "",
          categoryId: response.categoryId || "",
          status: response.status || ArticleStatus.DRAFT,
        };
        setArticleSettings(settings);
        form.setFieldsValue(settings);
      } catch (error) {
        console.error("获取文章失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id, form]);

  // 加载分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await articlesService.getArticleCountByCategory();
        setCategories(response || []);
      } catch (error) {
        console.error("获取分类失败:", error);
      }
    };
    fetchCategories();
  }, []);

  // 打开设置对话框
  const handleSave = useCallback(() => {
    if (!content.trim()) {
      Modal.warning({
        title: "内容为空",
        content: "请输入文章内容后再保存",
      });
      return;
    }
    setShowSettingsDialog(true);
  }, [content]);

  // 保存文章
  const saveArticle = async (formValues: any) => {
    try {
      setLoading(true);

      // 1. 上传 Markdown 内容到 OSS
      const markdownBlob = new Blob([content], {
        type: "text/markdown; charset=UTF-8",
      });
      const formData = new FormData();
      formData.append("file", markdownBlob, `${Date.now()}.md`);
      formData.append("type", "tech");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error("上传失败详情:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: error,
        });
        throw new Error(
          error.error ||
          `上传文件失败: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 保存文章信息
      const response = await articlesService.updateArticle(params.id, {
        title: formValues.title,
        content,
        ossPath,
        categoryId: formValues.categoryId,
        status: formValues.status,
        updatedAt: new Date().toISOString(),
      });

      if (response) {
        // 保存成功提示
        Modal.success({
          title: "保存成功",
          content: "文章已成功保存",
          onOk: () => {
            // 3. 跳转到文章列表页
            router.push("/admin/articles");
          },
        });
      }
    } catch (error) {
      Modal.error({
        title: "保存失败",
        content: error instanceof Error ? error.message : "保存失败，请重试",
      });
    } finally {
      setLoading(false);
      setShowSettingsDialog(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setArticleSettings(values);
    await saveArticle(values);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold m-0">{articleSettings.title}</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/admin/articles")}>取消</Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存
          </Button>
        </div>
      </Header>

      <Layout>
        <Content className="bg-white h-[calc(100vh-64px)] overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <div className="h-full">
              <MarkdownEditor
                initialContent={initialContentState}
                onChange={(value) => setContent(value)}
              />
            </div>
          )}
        </Content>
      </Layout>

      <Modal
        title="文章设置"
        open={showSettingsDialog}
        onCancel={() => setShowSettingsDialog(false)}
        footer={null}
        width={500}
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={articleSettings}
          disabled={loading}
        >
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="文章分类"
            rules={[{ required: true, message: "请选择文章分类" }]}
          >
            <Select placeholder="请选择分类">
              {categories?.map((category) => (
                <Select.Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="文章状态"
            rules={[{ required: true, message: "请选择文章状态" }]}
          >
            <Select>
              <Select.Option value={ArticleStatus.DRAFT}>草稿</Select.Option>
              <Select.Option value={ArticleStatus.PUBLISHED}>
                发布
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button
              className="mr-2"
              onClick={() => setShowSettingsDialog(false)}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              确认并保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default EditArticleContent;
