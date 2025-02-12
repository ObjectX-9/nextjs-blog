"use client";

import { useState, useEffect } from "react";
import { Friend } from "@/config/friends";
import { Button, message, Modal } from "antd";
import { FriendWithId } from "./types";
import { FriendTable } from "./components/FriendTable";
import { AddFriendModal } from "./components/AddFriendModal";
import { EditFriendModal } from "./components/EditFriendModal";
import { FriendDetailModal } from "./components/FriendDetailModal";

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
  const [actionModalFriend, setActionModalFriend] = useState<{
    friend: FriendWithId;
    index: number;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreviewUrl, setEditingPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
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
    return url.includes(".aliyuncs.com/");
  };

  const uploadImageFromUrl = async (imageUrl: string) => {
    try {
      const response = await fetch(
        `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      );
      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const fileExt = fileName.split(".").pop() || "jpg";
      const file = new File([blob], `avatar.${fileExt}`, { type: blob.type });

      return await uploadImage(file);
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      throw new Error("Failed to transfer image to OSS");
    }
  };

  const handleFileSelect = (file: File, isEditing: boolean = false) => {
    if (file.size > 10 * 1024 * 1024) {
      message.error("图片大小不能超过10MB");
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
      if (editingFriend) {
        setEditingFriend({
          ...editingFriend,
          friend: {
            ...editingFriend.friend,
            avatar: "",
          },
        });
      }
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
      message.error("获取友链失败，请重试");
    }
  };

  const handleAddFriend = async () => {
    if (newFriend.name && newFriend.link) {
      setIsUpdating(true);
      try {
        let avatarUrl = newFriend.avatar;

        if (selectedFile) {
          avatarUrl = await uploadImage(selectedFile);
        } else if (avatarUrl && !isOssUrl(avatarUrl)) {
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
          message.success('添加成功');
        } else {
          throw new Error(data.error || "Failed to add friend");
        }
      } catch (error) {
        console.error("Error adding friend:", error);
        message.error("添加友链失败，请重试");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteFriend = async (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个友链吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(`/api/friends?id=${_id}`, {
            method: "DELETE",
          });

          const data = await response.json();
          if (data.success) {
            await fetchFriends();
            message.success('删除成功');
          } else {
            throw new Error(data.error || "Failed to delete friend");
          }
        } catch (error) {
          console.error("Error deleting friend:", error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  const handleEditFriendSave = async () => {
    if (editingFriend) {
      setIsUpdating(true);
      try {
        let avatarUrl = editingFriend.friend.avatar;

        if (editingFile) {
          avatarUrl = await uploadImage(editingFile);
        } else if (
          avatarUrl &&
          !isOssUrl(avatarUrl) &&
          editingFriend.friend.isApproved
        ) {
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
          message.success('更新成功');
        } else {
          throw new Error(data.error || "Failed to update friend");
        }
      } catch (error) {
        console.error("Error updating friend:", error);
        message.error("更新友链失败，请重试");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100vh] w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold p-4 md:p-6">友链管理</h1>

      <div className="px-4 md:px-6 pb-6">
        <Button
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base"
          onClick={() => setShowAddFriend(true)}
        >
          添加友链
        </Button>

        <FriendTable
          friends={friends}
          onEdit={(friend, index) => setEditingFriend({ index, friend })}
          onDelete={(id) => handleDeleteFriend(id)}
          isMobile={window.innerWidth < 768}
        />
      </div>

      {showAddFriend && (
        <AddFriendModal
          visible={showAddFriend}
          onCancel={() => setShowAddFriend(false)}
          onAdd={handleAddFriend}
          friend={newFriend}
          onFriendChange={setNewFriend}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onFileSelect={(file) => handleFileSelect(file, false)}
          onRemoveFile={() => handleRemoveFile(false)}
          isUpdating={isUpdating}
        />
      )}

      {editingFriend && (
        <EditFriendModal
          visible={!!editingFriend}
          onCancel={() => setEditingFriend(null)}
          onSave={handleEditFriendSave}
          friend={editingFriend.friend}
          onFriendChange={(friend) => setEditingFriend({ ...editingFriend, friend })}
          editingFile={editingFile}
          editingPreviewUrl={editingPreviewUrl}
          onFileSelect={(file) => handleFileSelect(file, true)}
          onRemoveFile={() => handleRemoveFile(true)}
          isUpdating={isUpdating}
        />
      )}

      {actionModalFriend && (
        <FriendDetailModal
          friend={actionModalFriend.friend}
          visible={!!actionModalFriend}
          onCancel={() => setActionModalFriend(null)}
          onEdit={() => {
            setEditingFriend({
              index: actionModalFriend.index,
              friend: { ...actionModalFriend.friend },
            });
            setActionModalFriend(null);
          }}
          onDelete={() => {
            handleDeleteFriend(actionModalFriend.friend._id);
            setActionModalFriend(null);
          }}
        />
      )}
    </div>
  );
}
