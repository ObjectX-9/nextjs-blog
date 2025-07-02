"use client";

import { Modal, Form, Input, DatePicker, Button, Select } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { ITodo } from "@/app/model/types/todo";
import { IProjectRequirements } from "@/app/model/types/project-requirements";
import { statusConfig } from "./constants";

interface EditTodoModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    todo: ITodo | null;
    projectRequirements: IProjectRequirements[];
    loading?: boolean;
}

export function EditTodoModal({
    open,
    onCancel,
    onSubmit,
    todo,
    projectRequirements,
    loading = false
}: EditTodoModalProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (todo && open) {
            form.setFieldsValue({
                title: todo.title,
                description: todo.description,
                projectId: todo.projectId,
                priority: todo.priority || 3,
                dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
                status: todo.status
            });
        }
    }, [todo, open, form]);

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const handleFinish = (values: any) => {
        onSubmit(values);
    };

    return (
        <Modal
            title="编辑任务"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <Form.Item
                    name="title"
                    label="任务标题"
                    rules={[{ required: true, message: '请输入任务标题' }]}
                >
                    <Input placeholder="输入任务标题" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="任务描述"
                    rules={[{ required: true, message: '请输入任务描述' }]}
                >
                    <Input.TextArea rows={3} placeholder="输入任务描述" />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="任务状态"
                    rules={[{ required: true, message: '请选择任务状态' }]}
                >
                    <Select placeholder="选择任务状态">
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <Select.Option key={status} value={status}>
                                {config.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="projectId"
                    label="所属项目"
                >
                    <Select placeholder="选择所属项目（可选）" allowClear>
                        {projectRequirements.map((requirement) => (
                            <Select.Option key={requirement._id} value={requirement._id}>
                                {requirement.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="priority"
                        label="优先级"
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="选择优先级">
                            <Select.Option value={1}>低</Select.Option>
                            <Select.Option value={2}>中低</Select.Option>
                            <Select.Option value={3}>中</Select.Option>
                            <Select.Option value={4}>高</Select.Option>
                            <Select.Option value={5}>紧急</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="截止日期"
                        style={{ flex: 1 }}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="选择截止日期"
                        />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            更新任务
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
} 