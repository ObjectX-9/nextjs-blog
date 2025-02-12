'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Modal, Form, Input, Select, Spin, Drawer, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ArticleStatus, ArticleCategory } from '@/app/model/article';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';
import '@/styles/markdown.css';

const { Header, Content, Sider } = Layout;

const EditArticleContent = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articleSettings, setArticleSettings] = useState({
    title: '',
    categoryId: '',
    status: ArticleStatus.DRAFT
  });
  const [initialContentState, setInitialContentState] = useState('');

  // 获取文章内容
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?id=${params.id}`);
        const data = await response.json();
        const articleContent = data.content || '';
        setInitialContentState(articleContent);
        setContent(articleContent);

        // 设置文章其他信息
        const settings = {
          title: data.title || '',
          categoryId: data.categoryId || '',
          status: data.status || ArticleStatus.DRAFT
        };
        setArticleSettings(settings);
        form.setFieldsValue(settings);
      } catch (error) {
        console.error('获取文章失败:', error);
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
        const response = await fetch('/api/articles/categories');
        if (!response.ok) throw new Error('获取分类失败');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };
    fetchCategories();
  }, []);

  // 打开设置对话框
  const handleSave = useCallback(() => {
    if (!content.trim()) {
      Modal.warning({
        title: '内容为空',
        content: '请输入文章内容后再保存'
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
        type: 'text/markdown; charset=UTF-8'  
      });
      const formData = new FormData();
      formData.append('file', markdownBlob, `${Date.now()}.md`);
      formData.append('type', 'tech');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error('上传失败详情:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: error
        });
        throw new Error(error.error || `上传文件失败: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const { url: ossPath } = await uploadResponse.json();

      // 2. 保存文章信息
      const response = await fetch(`/api/articles?id=${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formValues.title,
          content,
          ossPath,
          categoryId: formValues.categoryId,
          status: formValues.status,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存文章失败');
      }

      const result = await response.json();
      
      // 保存成功提示
      Modal.success({
        title: '保存成功',
        content: '文章已成功保存',
        onOk: () => {
          // 3. 跳转到文章列表页
          router.push('/admin/articles');
        }
      });

    } catch (error: any) {
      console.error('保存文章失败:', error);
      Modal.error({
        title: '保存失败',
        content: error.message || '保存失败，请重试'
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
          <Button
            icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowSidebar(!showSidebar)}
          />
          <Button onClick={() => router.push('/admin/articles')}>
            取消
          </Button>
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

        <Drawer
          title={
            <div className="flex items-center gap-2">
              <UnorderedListOutlined />
              <span>目录</span>
            </div>
          }
          placement="right"
          width="20vw"
          onClose={() => setShowSidebar(false)}
          open={showSidebar}
          maskStyle={{ display: 'none' }}
          className="custom-drawer"
          styles={{
            body: { padding: '12px', height: 'calc(100vh - 55px)', overflow: 'auto' }
          }}
        >
          <nav className="space-y-1">
            {content.split('\n')
              .filter(line => line.startsWith('#'))
              .map((heading, index) => {
                const level = heading.match(/^#+/)?.[0].length || 1;
                const text = heading.replace(/^#+\s+/, '');
                return (
                  <div
                    key={index}
                    className={`
                      group flex items-center py-2 px-3 rounded-lg cursor-pointer 
                      transition-all duration-200 ease-in-out
                      hover:bg-blue-50 hover:text-blue-600
                      ${level === 1 ? 'font-medium text-gray-900' : 'text-gray-600'}
                    `}
                    style={{ 
                      paddingLeft: `${(level - 1) * 1.5 + 0.75}rem`,
                      borderLeft: level === 1 ? '3px solid #1677ff' : '3px solid transparent'
                    }}
                    onClick={() => {
                      const element = document.getElementById(text.toLowerCase().replace(/\s+/g, '-'));
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={text}
                  >
                    <div className={`
                      w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-200
                      ${level === 1 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 group-hover:bg-blue-400'
                      }
                    `} />
                    <Typography.Text
                      ellipsis={{ tooltip: text }}
                      className={`flex-1 ${level === 1 ? 'text-blue-600' : ''}`}
                    >
                      {text}
                    </Typography.Text>
                  </div>
                );
              })}
          </nav>
        </Drawer>
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
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="文章分类"
            rules={[{ required: true, message: '请选择文章分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="文章状态"
            rules={[{ required: true, message: '请选择文章状态' }]}
          >
            <Select>
              <Select.Option value={ArticleStatus.DRAFT}>草稿</Select.Option>
              <Select.Option value={ArticleStatus.PUBLISHED}>发布</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button className="mr-2" onClick={() => setShowSettingsDialog(false)}>
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
