"use client";

import { useState, useEffect } from "react";
import { Friend } from "@/config/friends";
import { ObjectId } from "mongodb";

interface FriendWithId extends Friend {
  _id: string;
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

  useEffect(() => {
    fetchFriends();
  }, []);

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
      try {
        const response = await fetch("/api/friends", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFriend),
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
          setShowAddFriend(false);
        } else {
          throw new Error(data.error || "Failed to add friend");
        }
      } catch (error) {
        console.error("Error adding friend:", error);
        alert("添加友链失败，请重试。");
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
      try {
        const response = await fetch(`/api/friends?id=${editingFriend.friend._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingFriend.friend),
        });

        const data = await response.json();
        if (data.success) {
          await fetchFriends();
          setEditingFriend(null);
        } else {
          throw new Error(data.error || "Failed to update friend");
        }
      } catch (error) {
        console.error("Error updating friend:", error);
        alert("更新友链失败，请重试。");
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h1 className="text-2xl font-bold p-6">友链管理</h1>

      <div className="px-6 pb-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setShowAddFriend(true)}
        >
          添加友链
        </button>

        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">头像</th>
                <th className="p-4 text-left">名称</th>
                <th className="p-4 text-left">标题</th>
                <th className="p-4 text-left">描述</th>
                <th className="p-4 text-left">链接</th>
                <th className="p-4 text-left">职位</th>
                <th className="p-4 text-left">地址</th>
                <th className="p-4 text-left">状态</th>
                <th className="p-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((friend, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[100px] truncate"
                      title={friend.name}
                    >
                      {friend.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.title}
                    >
                      {friend.title}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[200px] truncate"
                      title={friend.description}
                    >
                      {friend.description}
                    </span>
                  </td>
                  <td className="p-4">
                    <a
                      href={friend.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline block max-w-[200px] truncate"
                      title={friend.link}
                    >
                      {friend.link}
                    </a>
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.position || ""}
                    >
                      {friend.position || "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[150px] truncate"
                      title={friend.location || ""}
                    >
                      {friend.location || "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="block max-w-[100px] truncate"
                      title={friend.isApproved ? "已审核" : "待审核"}
                    >
                      {friend.isApproved ? "已审核" : "待审核"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                        onClick={() =>
                          setEditingFriend({
                            index,
                            friend: { ...friend },
                          })
                        }
                      >
                        编辑
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                        onClick={() => handleDeleteFriend(friend._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h3 className="text-lg font-semibold mb-4">添加友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  头像链接
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={newFriend.avatar}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, avatar: e.target.value })
                  }
                  placeholder="请输入头像链接"
                />
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
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowAddFriend(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h3 className="text-lg font-semibold mb-4">编辑友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  头像链接
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingFriend.friend.avatar}
                  onChange={(e) =>
                    setEditingFriend({
                      ...editingFriend,
                      friend: {
                        ...editingFriend.friend,
                        avatar: e.target.value,
                      },
                    })
                  }
                />
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
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setEditingFriend(null)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleEditFriendSave}
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
