"use client";

import { useState, useEffect } from "react";
import { Friend } from "@/config/friends";
import { ObjectId } from "mongodb";

interface FriendWithId extends Friend {
  _id: string;
}

interface ActionModalFriend {
  friend: FriendWithId;
  index: number;
}

export default function FriendsManagementPage() {
  const [friends, setFriends] = useState<FriendWithId[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [editingFriend, setEditingFriend] = useState<{
    index: number;
    friend: FriendWithId;
  } | null>(null);
  const [newFriend, setNewFriend] = useState<Friend>({
    avatar: "",
    name: "",
    title: "",
    description: "",
    link: "",
    position: "",
    location: "",
    isApproved: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionModalFriend, setActionModalFriend] =
    useState<ActionModalFriend | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreviewUrl, setEditingPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (editingPreviewUrl) {
        URL.revokeObjectURL(editingPreviewUrl);
      }
    };
  }, [previewUrl, editingPreviewUrl]);

  const isOssUrl = (url: string) => {
    // 检查URL是否来自阿里云OSS
    return url.includes(".aliyuncs.com/");
  };

  const uploadImageFromUrl = async (imageUrl: string) => {
    try {
      // 下载图片
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // 从URL中获取文件名和扩展名
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const fileExt = fileName.split(".").pop() || "jpg";

      // 创建File对象
      const file = new File([blob], `avatar.${fileExt}`, { type: blob.type });

      // 上传到OSS
      return await uploadImage(file);
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      throw new Error("Failed to transfer image to OSS");
    }
  };

  const handleFileSelect = (file: File, isEditing: boolean = false) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB");
      return;
    }

    if (isEditing) {
      if (editingPreviewUrl) {
        URL.revokeObjectURL(editingPreviewUrl);
      }
      setEditingFile(file);
      setEditingPreviewUrl(URL.createObjectURL(file));
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = (isEditing: boolean = false) => {
    if (isEditing) {
      if (editingPreviewUrl) {
        URL.revokeObjectURL(editingPreviewUrl);
      }
      setEditingFile(null);
      setEditingPreviewUrl("");
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "friendsAvatar");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error("No URL returned from upload");
    }

    return data.url;
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      alert("获取友链失败，请重试。");
    }
  };

  const handleAddFriend = async () => {
    if (newFriend.name && newFriend.link) {
      setIsUpdating(true);
      try {
        let avatarUrl = newFriend.avatar;

        // Upload new image if selected
        if (selectedFile) {
          avatarUrl = await uploadImage(selectedFile);
        } else if (avatarUrl && !isOssUrl(avatarUrl)) {
          // 如果有头像URL但不是OSS的链接，则转存到OSS
          avatarUrl = await uploadImageFromUrl(avatarUrl);
        }

        const response = await fetch("/api/friends", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newFriend,
            avatar: avatarUrl,
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchFriends();
          setNewFriend({
            avatar: "",
            name: "",
            title: "",
            description: "",
            link: "",
            position: "",
            location: "",
            isApproved: false,
          });
          setSelectedFile(null);
          setPreviewUrl("");
          setShowAddFriend(false);
        } else {
          throw new Error(data.error || "Failed to add friend");
        }
      } catch (error) {
        console.error("Error adding friend:", error);
        alert("添加友链失败，请重试。");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteFriend = async (_id: string) => {
    if (confirm("确定要删除这个友链吗？")) {
      try {
        const response = await fetch(`/api/friends?id=${_id}`, {
          method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
          await fetchFriends();
        } else {
          throw new Error(data.error || "Failed to delete friend");
        }
      } catch (error) {
        console.error("Error deleting friend:", error);
        alert("删除友链失败，请重试。");
      }
    }
  };

  const handleEditFriendSave = async () => {
    if (editingFriend) {
      setIsUpdating(true);
      try {
        let avatarUrl = editingFriend.friend.avatar;

        // Upload new image if selected
        if (editingFile) {
          avatarUrl = await uploadImage(editingFile);
        } else if (avatarUrl && !isOssUrl(avatarUrl)) {
          // 如果有头像URL但不是OSS的链接，则转存到OSS
          avatarUrl = await uploadImageFromUrl(avatarUrl);
        }

        const response = await fetch(
          `/api/friends?id=${editingFriend.friend._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...editingFriend.friend,
              avatar: avatarUrl,
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          await fetchFriends();
          setEditingFriend(null);
          setEditingFile(null);
          setEditingPreviewUrl("");
        } else {
          throw new Error(data.error || "Failed to update friend");
        }
      } catch (error) {
        console.error("Error updating friend:", error);
        alert("更新友链失败，请重试。");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold p-4 md:p-6">友链管理</h1>

      <div className="px-4 md:px-6 pb-6">
        <button
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base"
          onClick={() => setShowAddFriend(true)}
        >
          添加友链
        </button>

        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 md:p-4 text-left text-sm md:text-base w-[60px] md:w-[80px]">
                  头像
                </th>
                <th className="p-2 md:p-4 text-left text-sm md:text-base">
                  名称
                </th>
                <th className="hidden md:table-cell p-4 text-left">标题</th>
                <th className="hidden md:table-cell p-4 text-left">描述</th>
                <th className="hidden md:table-cell p-4 text-left">链接</th>
                <th className="hidden md:table-cell p-4 text-left">职位</th>
                <th className="hidden md:table-cell p-4 text-left">地址</th>
                <th className="p-2 md:p-4 text-left text-sm md:text-base">
                  状态
                </th>
                <th className="hidden md:table-cell p-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((friend, index) => (
                <tr
                  key={index}
                  className="border-t cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setActionModalFriend({ friend, index });
                    }
                  }}
                >
                  <td className="p-2 md:p-4">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </td>
                  <td className="p-2 md:p-4">
                    <span
                      className="block max-w-[100px] truncate text-sm md:text-base"
                      title={friend.name}
                    >
                      {friend.name}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.title}
                    >
                      {friend.title}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <span
                      className="block max-w-[200px] truncate"
                      title={friend.description}
                    >
                      {friend.description}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <a
                      href={friend.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline block max-w-[200px] truncate"
                      title={friend.link}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {friend.link}
                    </a>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.position || ""}
                    >
                      {friend.position || "-"}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.location || ""}
                    >
                      {friend.location || "-"}
                    </span>
                  </td>
                  <td className="p-2 md:p-4">
                    <span
                      className="block max-w-[100px] truncate text-sm md:text-base"
                      title={friend.isApproved ? "已审核" : "待审核"}
                    >
                      {friend.isApproved ? "已审核" : "待审核"}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFriend({
                            index,
                            friend: { ...friend },
                          });
                        }}
                      >
                        编辑
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFriend(friend._id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg w-[90vw] md:w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">添加友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">头像</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {(previewUrl || newFriend.avatar) && (
                    <div className="mb-4">
                      <img
                        src={previewUrl || newFriend.avatar}
                        alt="Friend avatar preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center text-sm text-gray-600">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file);
                        }
                      }}
                      className="hidden"
                      id="avatar-upload"
                    />
                    {!selectedFile && !newFriend.avatar ? (
                      <>
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                        >
                          点击选择图片或拖拽到此处
                        </label>
                        <p className="mt-1 text-gray-500">
                          支持 PNG、JPG、GIF 格式，最大 10MB
                        </p>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile()}
                        className="text-red-500 hover:text-red-600"
                      >
                        移除图片
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.name}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, name: e.target.value })
                  }
                  placeholder="请输入名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标题</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.title}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, title: e.target.value })
                  }
                  placeholder="请输入标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.description}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, description: e.target.value })
                  }
                  placeholder="请输入描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">链接</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.link}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, link: e.target.value })
                  }
                  placeholder="请输入链接"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">职位</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.position || ""}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, position: e.target.value })
                  }
                  placeholder="请输入职位（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地点</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.location || ""}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, location: e.target.value })
                  }
                  placeholder="请输入地点（可选）"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newFriend.isApproved}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, isApproved: e.target.checked })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">审核通过</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded text-sm md:text-base"
                  onClick={() => setShowAddFriend(false)}
                >
                  取消
                </button>
                <button
                  className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base"
                  onClick={handleAddFriend}
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg w-[90vw] md:w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">编辑友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">头像</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {(editingPreviewUrl || editingFriend.friend.avatar) && (
                    <div className="mb-4">
                      <img
                        src={editingPreviewUrl || editingFriend.friend.avatar}
                        alt="Friend avatar preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center text-sm text-gray-600">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file, true);
                        }
                      }}
                      className="hidden"
                      id="avatar-edit-upload"
                    />
                    {!editingFile && !editingFriend.friend.avatar ? (
                      <>
                        <label
                          htmlFor="avatar-edit-upload"
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                        >
                          点击选择图片或拖拽到此处
                        </label>
                        <p className="mt-1 text-gray-500">
                          支持 PNG、JPG、GIF 格式，最大 10MB
                        </p>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(true)}
                        className="text-red-500 hover:text-red-600"
                      >
                        移除图片
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.name}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标题</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.title}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        title: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.description}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        description: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">链接</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.link}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        link: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">职位</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.position || ""}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        position: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地点</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.location || ""}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        location: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingFriend.friend.isApproved}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        isApproved: e.target.checked,
                      },
                    })
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">审核通过</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded text-sm md:text-base"
                  onClick={() => setEditingFriend(null)}
                >
                  取消
                </button>
                <button
                  className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base"
                  onClick={handleEditFriendSave}
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {actionModalFriend && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50"
          onClick={() => setActionModalFriend(null)}
        >
          <div
            className="bg-white w-full md:w-auto md:min-w-[300px] rounded-t-xl md:rounded-xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={actionModalFriend.friend.avatar}
                alt={actionModalFriend.friend.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {actionModalFriend.friend.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {actionModalFriend.friend.title}
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="text-gray-500">链接：</span>
                <a
                  href={actionModalFriend.friend.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionModalFriend.friend.link}
                </a>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">描述：</span>
                {actionModalFriend.friend.description}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">职位：</span>
                {actionModalFriend.friend.position || "-"}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">地址：</span>
                {actionModalFriend.friend.location || "-"}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">状态：</span>
                {actionModalFriend.friend.isApproved ? "已审核" : "待审核"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="w-full px-4 py-2 bg-gray-500 text-white rounded text-base"
                onClick={() => {
                  setEditingFriend({
                    index: actionModalFriend.index,
                    friend: { ...actionModalFriend.friend },
                  });
                  setActionModalFriend(null);
                }}
              >
                编辑友链
              </button>
              <button
                className="w-full px-4 py-2 bg-red-500 text-white rounded text-base"
                onClick={() => {
                  handleDeleteFriend(actionModalFriend.friend._id);
                  setActionModalFriend(null);
                }}
              >
                删除友链
              </button>
              <button
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded text-base"
                onClick={() => setActionModalFriend(null)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
