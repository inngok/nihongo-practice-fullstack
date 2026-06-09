import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '../../../api/apiClient';

const { TextArea } = Input;

export default function ConfusingGrammarAddModal({ isOpen, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatPrompt, setAiChatPrompt] = useState('');
  const [patternInputs, setPatternInputs] = useState(['', '']);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setPatternInputs(['', '']);
      setAiChatPrompt('');
    }
  }, [isOpen, form]);

  const handleAddPatternInput = () => {
    setPatternInputs(prev => [...prev, '']);
  };

  const handleRemovePatternInput = (index) => {
    if (patternInputs.length <= 2) {
      message.warning('Phải có tối thiểu 2 mẫu để phân biệt.');
      return;
    }
    setPatternInputs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePatternChange = (value, index) => {
    setPatternInputs(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleTriggerAiGenerate = async () => {
    const title = form.getFieldValue('title');
    const description = form.getFieldValue('description');
    const validPatterns = patternInputs.filter(p => p.trim() !== '');

    if (!title) {
      message.warning('Vui lòng điền Tiêu đề nhóm trước.');
      return;
    }
    if (validPatterns.length < 2) {
      message.warning('Vui lòng nhập tối thiểu 2 mẫu ngữ pháp để AI phân biệt.');
      return;
    }

    try {
      setIsAiLoading(true);
      const res = await apiClient.post('/confusing-grammars/generate-ai', {
        title,
        description: description || '',
        patterns: validPatterns
      });

      const aiData = JSON.parse(res.data.data);
      
      form.setFieldsValue({
        explanation: aiData.explanation,
        tip: aiData.tip,
        items: aiData.items
      });

      message.success('AI đã tự động phân tích và điền dữ liệu thành công! Bạn có thể chỉnh sửa lại nếu cần.');
    } catch (err) {
      console.error('Lỗi AI tự động điền:', err);
      message.error('Dịch vụ AI gặp lỗi. Vui lòng điền tay hoặc thử lại sau.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTriggerAiChatGenerate = async () => {
    if (!aiChatPrompt.trim()) {
      message.warning('Vui lòng nhập yêu cầu phân tích của bạn vào Chatbox!');
      return;
    }

    try {
      setIsAiLoading(true);
      const res = await apiClient.post('/confusing-grammars/generate-ai-prompt', {
        prompt: aiChatPrompt
      });

      const aiData = JSON.parse(res.data.data);
      
      form.setFieldsValue({
        title: aiData.title,
        description: aiData.description,
        explanation: aiData.explanation,
        tip: aiData.tip,
        items: aiData.items
      });

      if (aiData.items && Array.isArray(aiData.items)) {
        setPatternInputs(aiData.items.map(item => item.pattern));
      }

      message.success('AI đã phân tích yêu cầu, tự động tìm các mẫu câu liên quan và điền dữ liệu thành công!');
    } catch (err) {
      console.error('Lỗi AI phân tích Prompt:', err);
      message.error('Không thể phân tích yêu cầu bằng AI. Vui lòng kiểm tra lại prompt hoặc thử lại sau.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async (values) => {
    const validPatterns = patternInputs.filter(p => p.trim() !== '');
    
    const items = values.items || validPatterns.map(pattern => ({
      pattern,
      baseMeaning: '',
      nuance: '',
      similarityPercentage: 50,
      exampleSentence: '',
      exampleRomaji: '',
      exampleTranslation: ''
    }));

    const payload = {
      title: values.title,
      description: values.description,
      explanation: values.explanation,
      tip: values.tip,
      items: items
    };

    try {
      await apiClient.post('/confusing-grammars', payload);
      message.success('Lưu nhóm phân biệt thành công!');
      onSuccess();
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
      message.error('Không thể lưu nhóm phân biệt.');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black text-base">
          <span>Tạo nhóm phân biệt mới</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      className="admin-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-6 space-y-6"
      >
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-6 text-left">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
            Trợ lý AI Chat soạn thảo nhanh
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input.TextArea
              value={aiChatPrompt}
              onChange={(e) => setAiChatPrompt(e.target.value)}
              placeholder="Nhập yêu cầu phân tích tự nhiên... ví dụ: Hãy phân biệt cho tôi các động từ như 気がする, 気にする, 気になる và các từ liên quan"
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="rounded-xl flex-grow font-semibold text-xs leading-relaxed"
              disabled={isAiLoading}
            />
            <Button
              type="primary"
              onClick={handleTriggerAiChatGenerate}
              loading={isAiLoading}
              className="bg-black text-white hover:bg-slate-850 dark:bg-white dark:text-black dark:hover:bg-slate-100 border-none font-bold rounded-xl h-auto px-6 py-2 flex items-center justify-center self-stretch sm:w-36"
            >
              {isAiLoading ? 'ĐANG SOẠN...' : 'PHÂN TÍCH'}
            </Button>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-2">
            * Mẹo: Bạn chỉ cần gõ yêu cầu phân biệt bằng ngôn ngữ tự nhiên, AI sẽ tự động trích xuất các từ, đặt câu ví dụ và điền toàn bộ Form dưới đây!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Form.Item
              name="title"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề nhóm</span>}
              rules={[{ required: true, message: 'Vui lòng điền tiêu đề!' }]}
            >
              <Input placeholder="ví dụ: Cho phép - Bắt buộc - Lời khuyên" className="rounded-xl h-10" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả tóm tắt</span>}
            >
              <TextArea rows={2} placeholder="Mô tả tóm tắt nội dung nhóm mẫu ngữ pháp này..." className="rounded-xl" />
            </Form.Item>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Mẫu ngữ pháp phân biệt (Tối thiểu 2)
              </span>
              
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {patternInputs.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Mẫu ${idx + 1} (ví dụ: 〜てもいい)`}
                      value={val}
                      onChange={(e) => handlePatternChange(e.target.value, idx)}
                      className="rounded-xl h-10 flex-grow"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemovePatternInput(idx)}
                    />
                  </div>
                ))}
              </div>
              
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddPatternInput}
                className="w-full rounded-xl mt-2 h-10 text-xs font-bold border-dashed text-slate-500"
              >
                Thêm mẫu phân biệt
              </Button>
            </div>

            <Button
              type="primary"
              onClick={handleTriggerAiGenerate}
              loading={isAiLoading}
              className="w-full bg-gradient-to-r from-slate-900 to-black text-white hover:opacity-90 border-none font-bold rounded-xl h-12 shadow-md flex items-center justify-center"
            >
              {isAiLoading ? 'AI ĐANG PHÂN TÍCH...' : 'PHÂN TÍCH VÀ TỰ ĐIỀN BẰNG AI'}
            </Button>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6">
            <Form.Item
              name="explanation"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân tích bản chất của AI</span>}
            >
              <TextArea rows={6} placeholder="Bản phân tích so sánh sẽ được điền tự động bởi AI tại đây..." className="rounded-xl text-xs font-medium leading-relaxed" />
            </Form.Item>

            <Form.Item
              name="tip"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mẹo nhớ nhanh</span>}
            >
              <TextArea rows={3} placeholder="Mẹo tránh nhầm lẫn từ AI..." className="rounded-xl text-xs font-medium leading-relaxed" />
            </Form.Item>
          </div>
        </div>

        <Form.List name="items">
          {(fields) => (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto pr-1">
              {fields.length > 0 && (
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">
                  Chi tiết từng mẫu ngữ pháp (AI tạo)
                </span>
              )}
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'pattern']}
                        rules={[{ required: true }]}
                        noStyle
                      >
                        <Input className="rounded-xl font-bold" readOnly />
                      </Form.Item>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'baseMeaning']}
                        noStyle
                      >
                        <Input placeholder="Nghĩa gốc" className="rounded-xl text-xs" />
                      </Form.Item>
                    </div>

                    <div className="sm:col-span-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'nuance']}
                        noStyle
                      >
                        <Input placeholder="Sắc thái (e.g. CẤM)" className="rounded-xl text-xs" />
                      </Form.Item>
                    </div>

                    <div className="sm:col-span-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'similarityPercentage']}
                        noStyle
                      >
                        <InputNumber placeholder="Độ phổ biến %" min={10} max={100} className="w-full rounded-xl text-xs" />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'exampleSentence']}
                        noStyle
                      >
                        <Input placeholder="Câu ví dụ tiếng Nhật" className="rounded-xl text-xs" />
                      </Form.Item>
                    </div>
                    <div className="sm:col-span-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'exampleRomaji']}
                        noStyle
                      >
                        <Input placeholder="Phiên âm Romaji" className="rounded-xl text-xs" />
                      </Form.Item>
                    </div>
                    <div className="sm:col-span-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'exampleTranslation']}
                        noStyle
                      >
                        <Input placeholder="Dịch nghĩa tiếng Việt" className="rounded-xl text-xs" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form.List>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose} className="rounded-xl font-bold h-10">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-black text-white hover:bg-slate-850 dark:bg-white dark:text-black font-bold rounded-xl h-10 px-6"
          >
            Lưu nhóm phân biệt
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
