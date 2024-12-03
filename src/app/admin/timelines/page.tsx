"use client";

import { useState } from "react";
import { TimelineEvent, TimelineLink, timelineEvents } from "@/config/timelines";

export default function TimelinesAdmin() {
  const [events, setEvents] = useState<TimelineEvent[]>(timelineEvents);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const saveToAPI = async (newEvents: TimelineEvent[]) => {
    try {
      const response = await fetch('/api/timelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: newEvents }),
      });

      if (!response.ok) {
        throw new Error('Failed to save timeline events');
      }

      const data = await response.json();
      if (data.success) {
        setEvents(newEvents);
      } else {
        throw new Error('Failed to save timeline events');
      }
    } catch (error) {
      console.error('Error saving timeline events:', error);
      alert('保存失败，请重试');
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

  const handleDeleteEvent = async (index: number) => {
    if (confirm('确定要删除这个时间轴事件吗？')) {
      const newEvents = [...events];
      newEvents.splice(index, 1);
      await saveToAPI(newEvents);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional URLs are allowed to be empty
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // Optional URLs are allowed to be empty
    return url.startsWith('/') || validateUrl(url);
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;

    // Reset errors
    setErrors({});
    const newErrors: { [key: string]: string } = {};

    // Validate URLs
    if (editingEvent.tweetUrl && !validateUrl(editingEvent.tweetUrl)) {
      newErrors.tweetUrl = '请输入有效的URL（以http://或https://开头）';
    }

    if (editingEvent.imageUrl && !validateImageUrl(editingEvent.imageUrl)) {
      newErrors.imageUrl = '请输入有效的图片URL（以/开头的相对路径或以http://、https://开头的完整URL）';
    }

    // Validate links
    if (editingEvent.links) {
      editingEvent.links.forEach((link, index) => {
        if (!validateUrl(link.url)) {
          newErrors[`link_${index}`] = '请输入有效的URL（以http://或https://开头）';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newEvents = [...events];
    if (editingIndex !== null) {
      newEvents[editingIndex] = editingEvent;
    } else {
      newEvents.push(editingEvent);
    }

    // Sort events by date (newest first)
    newEvents.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    await saveToAPI(newEvents);
    setEditingEvent(null);
    setEditingIndex(null);
    setErrors({});
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

  const handleUpdateLink = (index: number, field: keyof TimelineLink, value: string) => {
    if (!editingEvent?.links) return;
    const newLinks = [...editingEvent.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditingEvent({ ...editingEvent, links: newLinks });
    
    // Clear error when user starts typing
    if (field === 'url') {
      setErrors(prev => {
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
    return `${year}-${month.toString().padStart(2, '0')}`;
  };

  const toggleDescription = (index: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">时间轴管理</h1>
        <button
          onClick={handleAddEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          添加事件
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {event.year}年{event.month}月
                  </span>
                  <h3 className="font-semibold" title={event.title}>
                    {truncateText(event.title, 30)}
                  </h3>
                </div>
                {event.location && (
                  <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                )}
                <div className="mt-2 text-gray-600">
                  <p>{truncateDescription(event.description, !!expandedDescriptions[index])}</p>
                  {event.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(index)}
                      className="text-blue-500 text-sm hover:underline mt-1"
                    >
                      {expandedDescriptions[index] ? "收起" : "展开"}
                    </button>
                  )}
                </div>
                {event.links && event.links.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {event.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditEvent(event, index)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteEvent(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null ? "编辑事件" : "添加事件"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input
                  type="month"
                  className="w-full px-3 py-2 border rounded"
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
                  className="w-full px-3 py-2 border rounded"
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
                  className="w-full px-3 py-2 border rounded"
                  value={editingEvent.location || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
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
                  className={`w-full px-3 py-2 border rounded ${
                    errors.tweetUrl ? 'border-red-500' : ''
                  }`}
                  value={editingEvent.tweetUrl || ""}
                  onChange={(e) => {
                    setEditingEvent({ ...editingEvent, tweetUrl: e.target.value });
                    // Clear error when user starts typing
                    setErrors(prev => {
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
                  图片URL（可选）
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded ${
                    errors.imageUrl ? 'border-red-500' : ''
                  }`}
                  value={editingEvent.imageUrl || ""}
                  onChange={(e) => {
                    setEditingEvent({ ...editingEvent, imageUrl: e.target.value });
                    // Clear error when user starts typing
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.imageUrl;
                      return newErrors;
                    });
                  }}
                  placeholder="/images/example.jpg 或 https://"
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                )}
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
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="链接文本"
                      className="flex-1 px-3 py-2 border rounded"
                      value={link.text}
                      onChange={(e) => handleUpdateLink(index, "text", e.target.value)}
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="https://"
                        className={`w-full px-3 py-2 border rounded ${
                          errors[`link_${index}`] ? 'border-red-500' : ''
                        }`}
                        value={link.url}
                        onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                      />
                      {errors[`link_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`link_${index}`]}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setEditingIndex(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
