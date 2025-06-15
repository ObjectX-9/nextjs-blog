"use client";

import { useState, useEffect } from "react";
import {
  IWorkExperience,
  IWorkExperienceBase,
} from "@/app/model/work-experience";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Typography,
  Layout,
  Space,
  DatePicker,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { workExperienceBusiness } from "@/app/business/work-experience";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

export default function WorkExperienceManagementPage() {
  const [items, setItems] = useState<IWorkExperience[]>([]);
  const [editingItem, setEditingItem] = useState<IWorkExperienceBase | null>(
    null
  );
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      const workExperiences = await workExperienceBusiness.getWorkExperiences();
      setItems(workExperiences);
    } catch (error) {
      message.error("获取工作经历失败，请刷新重试");
    }
  };

  const handleSaveItem = async () => {
    const isUpdate = !!editingItem?._id;
    try {
      const values = await form.validateFields();
      const formData = {
        ...editingItem,
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.isCurrentJob
          ? null
          : values.endDate?.format("YYYY-MM-DD"),
      };

      const workExperience = isUpdate ? await workExperienceBusiness.updateWorkExperience(formData) : await workExperienceBusiness.createWorkExperience(formData);

      if (workExperience) {
        await fetchWorkExperiences();
        setEditingItem(null);
        form.resetFields();
        message.success(`${isUpdate ? "更新" : "创建"}成功`);
      } else {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"
          } work experience`
        );
      }
    } catch (error) {
      message.error("保存失败，请重试");
    }
  };

  const handleDeleteItem = async (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条工作经历吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await workExperienceBusiness.deleteWorkExperience(id);
          if (response) {
            await fetchWorkExperiences();
            message.success("删除成功");
          } else {
            throw new Error("Failed to delete work experience");
          }
        } catch (error) {
          message.error("删除失败，请重试");
        }
      },
    });
  };

  const handleAddItem = () => {
    form.resetFields();
    setEditingItem({
      _id: "",
      company: "",
      companyUrl: "",
      position: "",
      description: "",
      startDate: "",
      endDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEditItem = (item: IWorkExperience) => {
    form.setFieldsValue({
      ...item,
      startDate: dayjs(item.startDate),
      endDate: item.endDate ? dayjs(item.endDate) : null,
      isCurrentJob: item.endDate === null,
    });
    setEditingItem(item);
  };

  const ensureHttps = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="!mb-0">
              工作经历管理
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              size="large"
            >
              添加经历
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item._id}
                size="small"
                className="w-full"
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditItem(item)}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <div className="space-y-2">
                  <Space direction="vertical" size={1}>
                    <div className="flex items-center gap-2">
                      <Text strong className="text-lg">
                        {item.company}
                      </Text>
                      {item.companyUrl && (
                        <a
                          href={ensureHttps(item.companyUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <GlobalOutlined />
                        </a>
                      )}
                    </div>
                    <Text type="secondary">{item.position}</Text>
                  </Space>
                  <Paragraph className="!mb-1 whitespace-pre-wrap">
                    {item.description}
                  </Paragraph>
                  <Text type="secondary" className="text-sm">
                    {item.startDate} ~ {item.endDate || "至今"}
                  </Text>
                </div>
              </Card>
            ))}
          </div>

          <Modal
            title={
              <Title level={4} className="!mb-0">
                {editingItem?._id ? "编辑工作经历" : "添加工作经历"}
              </Title>
            }
            open={!!editingItem}
            onCancel={() => {
              setEditingItem(null);
              form.resetFields();
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setEditingItem(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleSaveItem}>
                保存
              </Button>,
            ]}
            width={720}
            destroyOnClose
            centered
          >
            <Form form={form} layout="vertical" className="mt-6">
              <Form.Item
                name="company"
                label="公司名称"
                rules={[{ required: true, message: "请输入公司名称" }]}
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>

              <Form.Item
                name="companyUrl"
                label="公司网址"
                rules={[{ type: "url", message: "请输入有效的URL" }]}
              >
                <Input
                  placeholder="请输入公司网址"
                  prefix={<GlobalOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: "请输入职位" }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>

              <Form.Item
                name="description"
                label="工作描述"
                rules={[{ required: true, message: "请输入工作描述" }]}
              >
                <TextArea
                  placeholder="请输入工作描述"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                name="startDate"
                label="开始时间"
                rules={[{ required: true, message: "请选择开始时间" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues?.isCurrentJob !== currentValues?.isCurrentJob
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="endDate"
                    label="结束时间"
                    rules={[
                      {
                        required: !getFieldValue("isCurrentJob"),
                        message: "请选择结束时间",
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-full"
                      disabled={getFieldValue("isCurrentJob")}
                    />
                  </Form.Item>
                )}
              </Form.Item>

              <Form.Item name="isCurrentJob" valuePropName="checked">
                <Checkbox>至今</Checkbox>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}
