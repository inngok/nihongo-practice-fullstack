import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Table, Button, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ConfusingGrammarAddModal from './components/ConfusingGrammarAddModal';

export default function ConfusingGrammarManager() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/confusing-grammars');
      setGroups(res.data);
    } catch (err) {
      console.error('Lỗi tải nhóm ngữ pháp:', err);
      message.error('Không thể tải danh sách nhóm phân biệt.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/confusing-grammars/${id}`);
      message.success('Đã xóa nhóm phân biệt thành công.');
      fetchGroups();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      message.error('Không thể xóa nhóm phân biệt.');
    }
  };



  const columns = [
    {
      title: 'Tiêu đề nhóm',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (text) => <span className="font-bold text-slate-800 dark:text-slate-200">{text}</span>
    },
    {
      title: 'Mô tả tóm tắt',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (text) => <span className="text-xs text-slate-500 dark:text-slate-450">{text}</span>
    },
    {
      title: 'Số mẫu',
      dataIndex: 'items',
      key: 'itemsCount',
      width: '15%',
      render: (items) => <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">{items?.length || 0} mẫu</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa nhóm này khỏi cơ sở dữ liệu?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-950 min-h-screen text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-100 dark:border-slate-850">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Quản Lý Phân Biệt Ngữ Pháp</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1.5">
            Xem và tạo các cụm ngữ pháp dễ nhầm lẫn. Tích hợp AI thông minh hỗ trợ phân sắc thái và đặt câu tự động.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsOpen(true)}
          className="bg-black text-white hover:bg-slate-850 dark:bg-white dark:text-black dark:hover:bg-slate-100 border-none font-bold rounded-lg px-5 h-10 shadow-sm"
        >
          THÊM NHÓM PHÂN BIỆT
        </Button>
      </div>

      {/* Main Table */}
      <Card className="rounded-2xl border-slate-100 dark:border-slate-850 dark:bg-slate-900 shadow-sm">
        <Table
          dataSource={groups}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="custom-admin-table"
        />
      </Card>

      <ConfusingGrammarAddModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => { setIsOpen(false); fetchGroups(); }}
      />

    </div>
  );
}
