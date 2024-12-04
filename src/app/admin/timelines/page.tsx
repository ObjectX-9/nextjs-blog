"use client";

import { useState, useEffect } from "react";

interface TimelineLink {
  text: string;
  url: string;
}

interface TimelineEvent {
  _id?: string;
  year: number;
  month: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: TimelineLink[];
}

export default function TimelinesAdmin() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/timelines");
      if (!response.ok) {
        throw new Error("Failed to fetch timeline events");
      }
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      alert("加载失败，请刷新页面重试");
    }
  };

  const handleAddEvent = () => {
    const now = new Date();
    setEditingEvent({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      title: "",
      description: "",
      links: [],
    });
    setEditingIndex(null);
  };

  const handleEditEvent = (event: TimelineEvent, index: number) => {
    setEditingEvent({ ...event });
    setEditingIndex(index);
  };

  const handleDeleteEvent = async (event: TimelineEvent) => {
    if (!event._id) return;

    if (confirm("确定要删除这个时间轴事件吗？")) {
      try {
        const response = await fetch(`/api/timelines?id=${event._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete timeline event");
        }

        const data = await response.json();
        if (data.success) {
          await fetchEvents(); // Refresh the events list
        } else {
          throw new Error("Failed to delete timeline event");
        }
      } catch (error) {
        console.error("Error deleting timeline event:", error);
        alert("删除失败，请重试");
      }
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

  const handleSaveEvent = async () => {
    if (!editingEvent) return;

    // Reset errors
    setErrors({});
    const newErrors: { [key: string]: string } = {};

    // Validate URLs
    if (editingEvent.tweetUrl && !validateUrl(editingEvent.tweetUrl)) {
      newErrors.tweetUrl = "请输入有效的URL（以http://或https://开头）";
    }

    // Validate links
    if (editingEvent.links) {
      editingEvent.links.forEach((link, index) => {
        if (!validateUrl(link.url)) {
          newErrors[`link_${index}`] =
            "请输入有效的URL（以http://或https://开头）";
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUploading(true);
    try {
      // Upload image if there's a selected file
      let finalImageUrl = editingEvent.imageUrl;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
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
        
        // Extract the path after the domain
        const url = new URL(data.url);
        finalImageUrl = url.pathname;
      }

      // Save event with the new image URL
      const eventToSave = {
        ...editingEvent,
        imageUrl: finalImageUrl,
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
        await fetchEvents(); // Refresh the events list
        setEditingEvent(null);
        setEditingIndex(null);
        setErrors({});
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
      } else {
        throw new Error("Failed to save timeline event");
      }
    } catch (error) {
      console.error("Error saving timeline event:", error);
      alert("保存失败，请重试");
    } finally {
      setIsUploading(false);
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
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`link_${index}`];
        return newErrors;
      });
    }
  };

  const handleDateChange = (value: string) => {
    if (!editingEvent) return;

    const date = new Date(value);
    setEditingEvent({
      ...editingEvent,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  };

  const formatDateValue = (year: number, month: number) => {
    return `${year}-${month.toString().padStart(2, "0")}`;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

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
  };

  return (
    <div className="p-4 md:p-6 bg-white relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">时间轴管理</h1>
        <button
          onClick={() => handleAddEvent()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          添加事件
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm bg-white relative">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span className="text-gray-500 text-sm md:text-base">
                    {event.year}年{event.month}月
                  </span>
                  <h3 className="font-semibold text-base md:text-lg" title={event.title}>
                    {truncateText(event.title, 30)}
                  </h3>
                </div>
                {event.location && (
                  <p className="text-sm text-gray-500">
                    📍 {event.location}
                  </p>
                )}
                <div className="text-gray-600">
                  <p className="text-sm md:text-base">
                    {truncateDescription(
                      event.description,
                      !!expandedDescriptions[index]
                    )}
                  </p>
                  {event.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(index)}
                      className="text-blue-500 text-sm hover:underline mt-2"
                    >
                      {expandedDescriptions[index] ? "收起" : "展开"}
                    </button>
                  )}
                </div>
                {event.links && event.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 w-full md:w-auto">
                <button
                  onClick={() => handleEditEvent(event, index)}
                  className="flex-1 md:flex-none px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteEvent(event)}
                  className="flex-1 md:flex-none px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-4 border-b z-10">
              <h2 className="text-lg font-semibold">
                {editingEvent._id ? "编辑事件" : "添加事件"}
              </h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg text-base"
                    value={formatDateValue(editingEvent.year, editingEvent.month)}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg text-base"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地点（可选）
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg text-base"
                    value={editingEvent.location || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg text-base min-h-[100px]"
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tweet URL（可选）
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg text-base ${
                      errors.tweetUrl ? "border-red-500" : ""
                    }`}
                    value={editingEvent.tweetUrl || ""}
                    onChange={(e) => {
                      setEditingEvent({
                        ...editingEvent,
                        tweetUrl: e.target.value,
                      });
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.tweetUrl;
                        return newErrors;
                      });
                    }}
                    placeholder="https://"
                  />
                  {errors.tweetUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.tweetUrl}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    图片
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center bg-white relative">
                    {(previewUrl || editingEvent.imageUrl) ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={previewUrl || editingEvent.imageUrl}
                          alt="Preview"
                          className="max-w-full max-h-[180px] object-contain bg-white"
                        />
                        <button
                          onClick={() => {
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md z-20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center w-full select-none">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          onChange={handleFileChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-block hover:opacity-80 transition-opacity"
                        >
                          <div className="mx-auto w-12 h-12 text-gray-400 mb-3">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-blue-600 text-sm font-medium">点击选择图片或拖拽到此处</p>
                          <p className="text-gray-500 text-xs mt-2">支持 PNG、JPG、GIF 格式，最大 10MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      链接（可选）
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      + 添加链接
                    </button>
                  </div>
                  {editingEvent.links?.map((link, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="链接文本"
                        className="flex-1 px-3 py-2 border rounded-lg text-base"
                        value={link.text}
                        onChange={(e) =>
                          handleUpdateLink(index, "text", e.target.value)
                        }
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="https://"
                          className={`w-full px-3 py-2 border rounded-lg text-base ${
                            errors[`link_${index}`] ? "border-red-500" : ""
                          }`}
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink(index, "url", e.target.value)
                          }
                        />
                        {errors[`link_${index}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`link_${index}`]}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="w-full md:w-auto px-3 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-3 z-10">
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setEditingIndex(null);
                      setErrors({});
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl("");
                      }
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={isUploading}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                  >
                    {isUploading ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
