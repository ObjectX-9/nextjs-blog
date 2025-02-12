import { Button, Table } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FriendWithId } from '../types';

interface FriendTableProps {
  friends: FriendWithId[];
  onEdit: (friend: FriendWithId, index: number) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

export const FriendTable = ({ friends, onEdit, onDelete, isMobile }: FriendTableProps) => {
  const columns: ColumnsType<FriendWithId> = [
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string, record) => (
        <Avatar
          src={<Image src={avatar} alt={record.name} width={32} height={32} />}
        />
      ),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "链接",
      dataIndex: "link",
      key: "link",
      ellipsis: true,
      responsive: ["md"],
      render: (link: string) => (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          {link}
        </a>
      ),
    },
    {
      title: "职位",
      dataIndex: "position",
      key: "position",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "地址",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "状态",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved: boolean) => (isApproved ? "已审核" : "待审核"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record, index) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record, index)}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record._id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <Table
        columns={columns}
        dataSource={friends}
        pagination={false}
      />
    </div>
  );
};
