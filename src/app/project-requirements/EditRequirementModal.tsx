import { Modal, Form, Input, DatePicker, Button, Select } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { ProjectRequirementsType } from "@/app/model/types/project-requirements";
import { IStack } from "@/app/model/stack";
import { Article } from "@/app/model/article";

interface EditRequirementModalProps {
    open: boolean;
    onCancel: () => void;
    onFinish: (values: any) => void;
    form: any;
    stacks: IStack[];
    articles: Article[];
}

export const EditRequirementModal = ({
    open,
    onCancel,
    onFinish,
    form,
    stacks,
    articles
}: EditRequirementModalProps) => {
    return (
        <Modal
            title="编辑项目需求"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="title"
                    label="需求标题"
                    rules={[{ required: true, message: '请输入需求标题' }]}
                >
                    <Input placeholder="输入需求标题" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="需求描述"
                    rules={[{ required: true, message: '请输入需求描述' }]}
                >
                    <Input.TextArea rows={3} placeholder="输入需求描述" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="type"
                        label="需求类型"
                        rules={[{ required: true, message: '请选择需求类型' }]}
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="选择需求类型">
                            <Select.Option value={ProjectRequirementsType.work}>工作</Select.Option>
                            <Select.Option value={ProjectRequirementsType.personal}>个人</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="difficultyLevel"
                        label="难度级别"
                        style={{ flex: 1 }}
                    >
                        <Select placeholder="选择难度级别">
                            <Select.Option value={1}>简单</Select.Option>
                            <Select.Option value={2}>中等</Select.Option>
                            <Select.Option value={3}>困难</Select.Option>
                            <Select.Option value={4}>极难</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="difficulty"
                    label="技术难点"
                >
                    <Input.TextArea rows={2} placeholder="描述技术难点（可选）" />
                </Form.Item>

                <Form.Item
                    name="techStack"
                    label="技术栈"
                >
                    <Select
                        mode="multiple"
                        placeholder="选择相关技术栈"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {stacks.map(stack => (
                            <Select.Option key={stack._id} value={stack._id}>
                                {stack.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="relatedDocs"
                    label="关联文档"
                >
                    <Form.List name="relatedDocs">
                        {(fields, { add, remove }) => (
                            <div className="space-y-3">
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="flex gap-2 items-end">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'type']}
                                            label={key === 0 ? "类型" : ""}
                                            style={{ flex: '0 0 100px' }}
                                            rules={[{ required: true, message: '请选择类型' }]}
                                        >
                                            <Select placeholder="类型">
                                                <Select.Option value="article">内部文章</Select.Option>
                                                <Select.Option value="url">外部链接</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prevValues, currentValues) =>
                                                prevValues.relatedDocs?.[name]?.type !== currentValues.relatedDocs?.[name]?.type
                                            }
                                        >
                                            {({ getFieldValue, setFieldValue }) => {
                                                const docType = getFieldValue(['relatedDocs', name, 'type']);
                                                if (docType === 'article') {
                                                    return (
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'value']}
                                                            label={key === 0 ? "选择/输入" : ""}
                                                            style={{ flex: 1 }}
                                                            rules={[{ required: true, message: '请选择文章' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择技术文章"
                                                                showSearch
                                                                filterOption={(input, option) =>
                                                                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                                                }
                                                                onChange={(value) => {
                                                                    // 自动填充文章标题
                                                                    const selectedArticle = articles.find(article => article._id === value);
                                                                    if (selectedArticle) {
                                                                        setFieldValue(['relatedDocs', name, 'title'], selectedArticle.title);
                                                                    }
                                                                }}
                                                            >
                                                                {articles.map(article => (
                                                                    <Select.Option key={article._id} value={article._id}>
                                                                        {article.title}
                                                                    </Select.Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    );
                                                }
                                                return (
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'value']}
                                                        label={key === 0 ? "选择/输入" : ""}
                                                        style={{ flex: 1 }}
                                                        rules={[{ required: true, message: '请输入链接URL' }]}
                                                    >
                                                        <Input placeholder="输入外部链接URL" />
                                                    </Form.Item>
                                                );
                                            }}
                                        </Form.Item>

                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prevValues, currentValues) =>
                                                prevValues.relatedDocs?.[name]?.type !== currentValues.relatedDocs?.[name]?.type
                                            }
                                        >
                                            {({ getFieldValue }) => {
                                                const docType = getFieldValue(['relatedDocs', name, 'type']);
                                                if (docType === 'url') {
                                                    return (
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'title']}
                                                            label={key === 0 ? "显示标题" : ""}
                                                            style={{ flex: 1 }}
                                                            rules={[{ required: true, message: '请输入显示标题' }]}
                                                        >
                                                            <Input placeholder="显示标题" />
                                                        </Form.Item>
                                                    );
                                                }
                                                // 内部文章需要隐藏的title字段来收集数据
                                                return (
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'title']}
                                                        style={{ display: 'none' }}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                );
                                            }}
                                        </Form.Item>

                                        <Form.Item label={key === 0 ? " " : ""}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<Trash2 size={14} />}
                                                onClick={() => remove(name)}
                                            />
                                        </Form.Item>
                                    </div>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<Plus size={14} />}
                                    className="w-full"
                                >
                                    添加文档
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item
                    name="relatedGithubRepos"
                    label="关联 GitHub 仓库"
                >
                    <Form.List name="relatedGithubRepos">
                        {(fields, { add, remove }) => (
                            <div className="space-y-3">
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="flex gap-2 items-end">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'repoName']}
                                            label={key === 0 ? "仓库名称" : ""}
                                            style={{ flex: 1 }}
                                            rules={[{ required: true, message: '请输入仓库名称' }]}
                                        >
                                            <Input placeholder="例如：facebook/react" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'repoUrl']}
                                            label={key === 0 ? "仓库链接" : ""}
                                            style={{ flex: 1 }}
                                            rules={[
                                                { required: true, message: '请输入仓库链接' },
                                                { type: 'url', message: '请输入有效的URL' }
                                            ]}
                                        >
                                            <Input placeholder="https://github.com/facebook/react" />
                                        </Form.Item>

                                        <Form.Item label={key === 0 ? " " : ""}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<Trash2 size={14} />}
                                                onClick={() => remove(name)}
                                            />
                                        </Form.Item>
                                    </div>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<Plus size={14} />}
                                    className="w-full"
                                >
                                    添加 GitHub 仓库
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="startDate"
                        label="开始日期"
                        style={{ flex: 1 }}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="选择开始日期"
                        />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="结束日期"
                        style={{ flex: 1 }}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="选择结束日期"
                        />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit">
                            更新需求
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}; 