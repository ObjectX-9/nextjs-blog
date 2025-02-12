"use client";

import { useState, useEffect, useCallback } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Space,
  Card,
  message,
  Typography,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

interface TimelineLink {
  text: string;
  url: string;
}

interface TimelineEvent {
  _id?: string;
  year: number;
  month: number;
  day: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: TimelineLink[];
}

export default function TimelinesAdmin() {
  const [form] = Form.useForm();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);

  // Fetch events on component mount
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/timelines");
      if (!response.ok) {
        throw new Error("Failed to fetch timeline events");
      }
      const data = await response.json();
      setEvents(sortEvents(data.events));
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      alert("加载失败，请刷新页面重试");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = () => {
    const now = new Date();
    setEditingEvent({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      title: "",
      description: "",
      links: [],
    });
    setEditingIndex(null);
    form.resetFields();
  };

  const handleEditEvent = (event: TimelineEvent, index: number) => {
    setEditingEvent({ ...event });
    setEditingIndex(index);
    form.setFieldsValue({
      date: dayjs(
        `${event.year}-${String(event.month).padStart(2, "0")}-${String(
          event.day
        ).padStart(2, "0")}`
      ),
      title: event.title,
      location: event.location || "",
      description: event.description,
      tweetUrl: event.tweetUrl || "",
      links: event.links || [],
    });
  };

  const handleDeleteEvent = async (event: TimelineEvent) => {
    if (!event._id) return;

    try {
      const response = await fetch(`/api/timelines?id=${event._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete timeline event");
      }

      const data = await response.json();
      if (data.success) {
        message.success("删除成功");
        await fetchEvents();
      } else {
        throw new Error("Failed to delete timeline event");
      }
    } catch (error) {
      console.error("Error deleting timeline event:", error);
      message.error("删除失败，请重试");
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional URLs are allowed to be empty
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1.9,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      console.log("开始压缩图片...");
      console.log("原始文件大小:", (file.size / 1024 / 1024).toFixed(2), "MB");

      const compressedFile = await imageCompression(file, options);
      console.log(
        "压缩后文件大小:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      // Create a new File object to preserve the original filename
      return new File([compressedFile], file.name, {
        type: compressedFile.type,
      });
    } catch (error) {
      console.error("压缩图片时出错:", error);
      throw error;
    }
  };

  const handleSaveEvent = async () => {
    try {
      const values = await form.validateFields();
      const date = values.date as dayjs.Dayjs;

      // Upload image if there's a selected file
      let finalImageUrl = editingEvent?.imageUrl;
      if (selectedFile) {
        setIsCompressing(true);
        let fileToUpload = selectedFile;

        // Compress image if size is over 1.9MB
        if (selectedFile.size > 1.9 * 1024 * 1024) {
          try {
            fileToUpload = await compressImage(selectedFile);
          } catch (error: any) {
            throw new Error(`图片压缩失败: ${error.message}`);
          }
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("directory", "timelines");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (!data.url) {
          throw new Error("No URL returned from upload");
        }

        finalImageUrl = data.url;
      }

      const eventToSave = {
        ...editingEvent,
        year: date.year(),
        month: date.month() + 1,
        day: date.date(),
        title: values.title,
        location: values.location,
        description: values.description,
        tweetUrl: values.tweetUrl,
        imageUrl: finalImageUrl,
        links: values.links,
      };

      const method = eventToSave._id ? "PUT" : "POST";
      const url = "/api/timelines";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          eventToSave._id ? eventToSave : { events: [eventToSave] }
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to save timeline event");
      }

      const data = await response.json();
      if (data.success) {
        message.success("保存成功");
        await fetchEvents();
        setEditingEvent(null);
        setEditingIndex(null);
        form.resetFields();
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
        setSelectedFile(null);
      } else {
        throw new Error("Failed to save timeline event");
      }
    } catch (error) {
      console.error("Error saving timeline event:", error);
      message.error("保存失败，请重试");
    } finally {
      setIsUploading(false);
      setIsCompressing(false);
    }
  };

  const handleAddLink = () => {
    if (!editingEvent) return;
    const newLinks = [...(editingEvent.links || []), { text: "", url: "" }];
    setEditingEvent({ ...editingEvent, links: newLinks });
  };

  const handleRemoveLink = (index: number) => {
    if (!editingEvent?.links) return;
    const newLinks = [...editingEvent.links];
    newLinks.splice(index, 1);
    setEditingEvent({ ...editingEvent, links: newLinks });
  };

  const handleUpdateLink = (
    index: number,
    field: keyof TimelineLink,
    value: string
  ) => {
    if (!editingEvent?.links) return;
    const newLinks = [...editingEvent.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditingEvent({ ...editingEvent, links: newLinks });

    // Clear error when user starts typing
    if (field === "url") {
      // setErrors((prev) => {
      //   const newErrors = { ...prev };
      //   delete newErrors[`link_${index}`];
      //   return newErrors;
      // });
    }
  };

  const handleDateChange = (value: string) => {
    if (!editingEvent) return;

    const date = new Date(value);
    setEditingEvent({
      ...editingEvent,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  };

  const formatDateValue = (year: number, month: number, day: number) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  const sortEvents = (events: TimelineEvent[]) => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day || 1);
      const dateB = new Date(b.year, b.month - 1, b.day || 1);
      return dateB.getTime() - dateA.getTime(); // 降序排列，最新的在前
    });
  };

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const truncateDescription = (text: string, expanded: boolean) => {
    if (!text) return "";
    if (expanded || text.length <= 100) return text;
    return text.slice(0, 100) + "...";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    try {
      setSelectedFile(file);

      // Create preview URL
      const prevUrl = previewUrl;
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      // Clean up old preview URL
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }

      // Clear the imageUrl when a new file is selected
      if (editingEvent) {
        setEditingEvent({
          ...editingEvent,
          imageUrl: "",
        });
      }
    } catch (error: any) {
      console.error("处理图片时出错:", error);
      alert(error.message || "处理图片时出错");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2} style={{ margin: 0 }}>
          时间轴管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent}>
          添加事件
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <Card key={index} className="w-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <Space align="start" className="flex-wrap">
                  <Text type="secondary" className="whitespace-nowrap">
                    {event.year}年{event.month}月{event.day}日
                  </Text>
                  <Typography.Title 
                    level={4} 
                    style={{ 
                      margin: 0,
                      maxWidth: '100%',
                    }}
                    ellipsis={{ 
                      tooltip: event.title 
                    }}
                  >
                    {event.title}
                  </Typography.Title>
                </Space>
                
                {event.location && (
                  <div>
                    <Space>
                      <EnvironmentOutlined className="text-gray-400" />
                      <Text type="secondary">{event.location}</Text>
                    </Space>
                  </div>
                )}

                {event.imageUrl && (
                  <div className="relative w-full aspect-[16/9] max-w-2xl mx-auto overflow-hidden rounded-lg bg-gray-50">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <Paragraph
                  ellipsis={
                    !expandedDescriptions[index]
                      ? { rows: 3, expandable: true, symbol: "展开" }
                      : false
                  }
                  onClick={() => toggleDescription(index)}
                  className="text-gray-600 mb-0"
                >
                  {event.description}
                </Paragraph>

                {event.links && event.links.length > 0 && (
                  <Space wrap size={[8, 8]} className="pt-2">
                    {event.links.map((link, linkIndex) => (
                      <Button
                        key={linkIndex}
                        type="link"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!px-2 !h-auto"
                      >
                        {link.text}
                      </Button>
                    ))}
                  </Space>
                )}
              </div>

              <Space className="justify-end">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEditEvent(event, index)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个时间轴事件吗？"
                  onConfirm={() => handleDeleteEvent(event)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editingEvent?._id ? "编辑事件" : "添加事件"}
        open={!!editingEvent}
        onCancel={() => {
          setEditingEvent(null);
          setEditingIndex(null);
          form.resetFields();
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
          }
          setSelectedFile(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditingEvent(null);
              setEditingIndex(null);
              form.resetFields();
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl("");
              }
              setSelectedFile(null);
            }}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUploading || isCompressing}
            onClick={handleSaveEvent}
          >
            {isUploading ? "保存中..." : isCompressing ? "压缩中..." : "保存"}
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: editingEvent
              ? dayjs(
                  `${editingEvent.year}-${String(editingEvent.month).padStart(
                    2,
                    "0"
                  )}-${String(editingEvent.day).padStart(2, "0")}`
                )
              : dayjs(),
            title: editingEvent?.title || "",
            location: editingEvent?.location || "",
            description: editingEvent?.description || "",
            tweetUrl: editingEvent?.tweetUrl || "",
          }}
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: "请选择日期" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="地点" name="location">
            <Input prefix={<EnvironmentOutlined />} placeholder="可选" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: "请输入描述" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Tweet URL"
            name="tweetUrl"
            rules={[
              {
                type: "url",
                message: "请输入有效的URL",
              },
            ]}
          >
            <Input placeholder="https://" />
          </Form.Item>

          <Form.Item label="图片">
            <Upload.Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileChange({ target: { files: [file] } } as any);
                return false;
              }}
              accept="image/*"
            >
              {previewUrl || editingEvent?.imageUrl ? (
                <div className="relative">
                  <Image
                    src={previewUrl || editingEvent?.imageUrl || ""}
                    alt="Preview"
                    width={200}
                    height={120}
                    className="max-w-full max-h-[180px] object-contain bg-white mx-auto"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="absolute top-0 right-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl("");
                      setSelectedFile(null);
                      if (editingEvent) {
                        setEditingEvent({
                          ...editingEvent,
                          imageUrl: "",
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击选择或拖拽图片到此处</p>
                  <p className="ant-upload-hint">
                    支持 PNG、JPG、GIF 格式，最大 10MB
                  </p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>

          <Form.List name="links" initialValue={editingEvent?.links || []}>
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-2">
                  <Typography.Text>链接</Typography.Text>
                  <Button
                    type="link"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    添加链接
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <Space
                    key={field.key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "text"]}
                      rules={[{ required: true, message: "请输入链接文本" }]}
                    >
                      <Input placeholder="链接文本" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "url"]}
                      rules={[
                        { required: true, message: "请输入URL" },
                        { type: "url", message: "请输入有效的URL" },
                      ]}
                    >
                      <Input placeholder="https://" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      onClick={() => remove(field.name)}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
