import { useState } from 'react';
export interface TodoListProps {
  title: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoList = ({ title }: TodoListProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: input.trim(),
          completed: false
        }
      ]);
      setInput('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="todo-list">
      <h3>{title}</h3>
      <div className="add-todo">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新待办..."
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            marginRight: '8px'
          }}
        />
        <button
          onClick={addTodo}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            padding: '4px 8px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          添加
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '8px 0',
              padding: '4px 0'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ marginRight: '8px' }}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : '#000',
                flex: 1
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                backgroundColor: '#ff4d4f',
                color: 'white',
                padding: '2px 6px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

