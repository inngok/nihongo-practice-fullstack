import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { fetchWithAuth } = useAuth();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const API_URL = 'http://localhost:8080/api/users';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_URL);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        messageApi.error('Lỗi khi tải danh sách người dùng');
      }
    } catch (error) {
      console.error(error);
      messageApi.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'STUDENT' });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role || 'STUDENT'
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        messageApi.success('Xóa người dùng thành công');
        fetchUsers();
      } else {
        messageApi.error('Lỗi khi xóa người dùng');
      }
    } catch (error) {
      console.error(error);
      messageApi.error('Không thể kết nối đến server');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL;

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        messageApi.success(`${editingUser ? 'Cập nhật' : 'Thêm mới'} người dùng thành công`);
        setIsModalVisible(false);
        fetchUsers();
      } else {
        const errorMsg = await response.text();
        messageApi.error(errorMsg || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'ADMIN' || role === 'admin' ? 'red' : 'blue';
        return <Tag color={color}>{role ? role.toUpperCase() : 'STUDENT'}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        {contextHolder}
        
        {/* Simple Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý User</h1>
            <p className="text-slate-400 text-[13px] font-medium">Quản lý tài khoản và phân quyền hệ thống</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
          >
            <PlusOutlined className="text-[10px]" />
            Thêm người dùng
          </button>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden premium-table">
          <Table 
            columns={columns} 
            dataSource={users} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: "bg-black hover:!bg-slate-800" }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: !editingUser, message: 'Vui lòng nhập mật khẩu!' }]}
            help={editingUser ? "Bỏ trống nếu không muốn đổi mật khẩu" : ""}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              <Select.Option value="STUDENT">Học viên (Student)</Select.Option>
              <Select.Option value="ADMIN">Quản trị viên (Admin)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
