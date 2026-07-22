import React from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';
import { SCENARIOS } from '../constants';

export default function ScenarioSelector({ onStartScenario }) {
  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col justify-center overflow-y-auto">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 uppercase mb-2 block">
            <ThunderboltOutlined className="mr-1" /> LUYỆN PHẢN XẠ THỜI GIAN THỰC
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-none flex flex-wrap items-center gap-4">
            Đàm thoại Giao tiếp AI
            <span className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Chưa hoàn thiện
            </span>
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium max-w-sm md:text-right">
          Nhập vai vào các tình huống thực tế thường ngày của người Nhật Bản để kiểm tra chính tả, trợ từ và phản xạ giao tiếp tự nhiên.
        </p>
      </div>

      {/* Minimalist Typographic Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => onStartScenario(scenario)}
            className="group relative bg-white border border-slate-100 hover:border-black rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer h-60 shadow-sm"
          >
            {/* Numeral Prefix Label */}
            <span className="absolute top-6 left-8 text-[10px] font-black text-slate-200 group-hover:text-black uppercase tracking-widest transition-colors">
              SCENARIO {scenario.num}
            </span>

            {/* Subtitle Badge right-aligned */}
            <div className="flex justify-end mb-4">
              <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider">
                {scenario.subTitle}
              </span>
            </div>

            <div className="my-2">
              <h3 className="text-base font-extrabold text-slate-900 group-hover:scale-[1.01] transition-transform duration-300">
                {scenario.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1.5">
                {scenario.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black transition-colors">
              <span>Bắt đầu đàm thoại</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
