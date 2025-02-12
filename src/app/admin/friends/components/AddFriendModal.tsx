import { Modal, Form, Input, Checkbox, Button } from 'antd';
import { Friend } from '@/config/friends';
import { AvatarUpload } from './AvatarUpload';

interface AddFriendModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: () => void;
  friend: Friend;
  onFriendChange: (friend: Friend) => void;
  selectedFile: File | null;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  isUpdating: boolean;
}

export const AddFriendModal = ({
  visible,
  onCancel,
  onAdd,
  friend,
  onFriendChange,
  selectedFile,
  previewUrl,
  onFileSelect,
  onRemoveFile,
  isUpdating,
}: AddFriendModalProps) => {
  return (
    <Modal
      title="添加友链"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={friend}
      >
        <Form.Item label="头像" name="avatar">
          <AvatarUpload
            imageUrl={friend.avatar}
            previewUrl={previewUrl}
            onFileSelect={onFileSelect}
            onRemove={onRemoveFile}
            hasFile={!!selectedFile}
          />
        </Form.Item>
        <Form.Item label="名称" name="name">
          <Input
            value={friend.name}
            onChange={(e) =>
              onFriendChange({ ...friend, name: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="标题" name="title">
          <Input
            value={friend.title}
            onChange={(e) =>
              onFriendChange({ ...friend, title: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input
            value={friend.description}
            onChange={(e) =>
              onFriendChange({ ...friend, description: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="链接" name="link">
          <Input
            value={friend.link}
            onChange={(e) =>
              onFriendChange({ ...friend, link: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="职位" name="position">
          <Input
            value={friend.position || ""}
            onChange={(e) =>
              onFriendChange({ ...friend, position: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="地址" name="location">
          <Input
            value={friend.location || ""}
            onChange={(e) =>
              onFriendChange({ ...friend, location: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="状态" name="isApproved" valuePropName="checked">
          <Checkbox
            checked={friend.isApproved}
            onChange={(e) =>
              onFriendChange({ ...friend, isApproved: e.target.checked })
            }
          >
            审核通过
          </Checkbox>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
          <Button
            type="primary"
            onClick={onAdd}
            loading={isUpdating}
          >
            确认添加
          </Button>
          <Button
            type="default"
            onClick={onCancel}
            style={{ marginLeft: 16 }}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
