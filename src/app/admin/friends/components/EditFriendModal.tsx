import { Modal, Form, Input, Checkbox, Button } from 'antd';
import { FriendWithId } from '../types';
import { AvatarUpload } from './AvatarUpload';

interface EditFriendModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
  friend: FriendWithId;
  onFriendChange: (friend: FriendWithId) => void;
  editingFile: File | null;
  editingPreviewUrl: string;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  isUpdating: boolean;
}

export const EditFriendModal = ({
  visible,
  onCancel,
  onSave,
  friend,
  onFriendChange,
  editingFile,
  editingPreviewUrl,
  onFileSelect,
  onRemoveFile,
  isUpdating,
}: EditFriendModalProps) => {
  return (
    <Modal
      title="编辑友链"
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
            previewUrl={editingPreviewUrl}
            onFileSelect={onFileSelect}
            onRemove={onRemoveFile}
            hasFile={!!editingFile}
          />
        </Form.Item>
        <Form.Item label="名称" name="name">
          <Input
            value={friend.name}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                name: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="标题" name="title">
          <Input
            value={friend.title}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                title: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input
            value={friend.description}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                description: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="链接" name="link">
          <Input
            value={friend.link}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                link: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="职位" name="position">
          <Input
            value={friend.position || ""}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                position: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="地址" name="location">
          <Input
            value={friend.location || ""}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                location: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="状态" name="isApproved" valuePropName="checked">
          <Checkbox
            checked={friend.isApproved}
            onChange={(e) =>
              onFriendChange({
                ...friend,
                isApproved: e.target.checked,
              })
            }
          >
            审核通过
          </Checkbox>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
          <Button
            type="primary"
            onClick={onSave}
            loading={isUpdating}
          >
            保存修改
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
