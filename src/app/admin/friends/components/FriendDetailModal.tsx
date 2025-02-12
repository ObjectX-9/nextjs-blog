import { Modal, Descriptions, Avatar, Button } from 'antd';
import Image from 'next/image';
import { FriendWithId } from '../types';

interface FriendDetailModalProps {
  friend: FriendWithId;
  visible: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const FriendDetailModal = ({
  friend,
  visible,
  onCancel,
  onEdit,
  onDelete,
}: FriendDetailModalProps) => {
  return (
    <Modal
      title={friend.name}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="头像">
          <Avatar
            src={
              <Image
                src={friend.avatar}
                alt={friend.name}
                width={48}
                height={48}
              />
            }
          />
        </Descriptions.Item>
        <Descriptions.Item label="标题">
          {friend.title}
        </Descriptions.Item>
        <Descriptions.Item label="描述">
          {friend.description}
        </Descriptions.Item>
        <Descriptions.Item label="链接">
          <a
            href={friend.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            {friend.link}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="职位">
          {friend.position || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="地址">
          {friend.location || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {friend.isApproved ? "已审核" : "待审核"}
        </Descriptions.Item>
      </Descriptions>
      <div className="flex gap-2 justify-end mt-4">
        <Button type="primary" onClick={onEdit}>
          编辑友链
        </Button>
        <Button danger onClick={onDelete}>
          删除友链
        </Button>
        <Button type="default" onClick={onCancel}>
          取消
        </Button>
      </div>
    </Modal>
  );
};
