import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function KeigoPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full flex-grow bg-white dark:bg-black flex flex-col items-center pt-24 md:pt-32 pb-16 px-4 md:px-6 font-sans">
      <div className="w-full max-w-5xl bg-white dark:bg-black rounded-none md:rounded-xl md:border md:border-black dark:md:border-white p-4 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          QUAY LẠI
        </button>

        <div className="text-center mb-10 border-b-2 border-black dark:border-white pb-6">
          <h1 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">
            CẨM NANG KÍNH NGỮ
          </h1>
          <p className="text-black dark:text-white font-bold text-sm">Bí kíp sinh tồn giao tiếp & phá đảo đề thi JLPT (N4 - N1)</p>
        </div>

        <div className="space-y-12 text-black dark:text-white">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">1</span>
              Động Từ Bất Quy Tắc Cơ Bản
            </h2>
            <div className="overflow-x-auto border border-black dark:border-white rounded">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-black text-white dark:bg-white dark:text-black uppercase text-xs">
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/5 font-black">Động từ gốc</th>
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/6 font-black">Ý nghĩa</th>
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/3 font-black">Tôn Kính Ngữ (Sếp làm)</th>
                    <th className="p-3 w-1/3 font-black">Khiêm Nhường Ngữ (Mình làm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black dark:divide-white bg-white dark:bg-black text-sm">
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">行く / 来る / いる</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Đi / Đến / Ở</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">いらっしゃる<br /><span className="text-xs font-bold text-slate-500 dark:text-slate-400">おいでになる</span></td>
                    <td className="p-3 font-black">参（まい）る / おる<br /><span className="text-xs font-bold text-slate-500 dark:text-slate-400">伺（うかが）う (Đi/Đến thăm)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white">食べる / 飲む</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Ăn / Uống</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">召（め）し上がる</td>
                    <td className="p-3 font-black">いただく / 頂戴（ちょうだい）する</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">言う</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Nói</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">おっしゃる</td>
                    <td className="p-3 font-black">申（もう）す / 申し上げる</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white">する</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Làm</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">なさる</td>
                    <td className="p-3 font-black">いたす</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">見る</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Nhìn, Xem</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">ご覧（らん）になる</td>
                    <td className="p-3 font-black">拝見（はいけん）する</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white">聞く / 尋ねる</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Nghe / Hỏi</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">お聞きになる / お尋ねになる</td>
                    <td className="p-3 font-black">伺（うかが）う / 承（うけたまわ）る</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">知っている</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Biết</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">ご存（ぞん）じだ</td>
                    <td className="p-3 font-black">存（ぞん）じておる / 存じ上げる</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white">会う</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Gặp</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">お会いになる</td>
                    <td className="p-3 font-black">お目（め）にかかる</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">見せる</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Cho xem</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">お見せになる</td>
                    <td className="p-3 font-black">お目（め）にかける</td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white text-xs">与える / くれる (Tặng/Cho)</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">Cho (mình)</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">くださる</td>
                    <td className="p-3 font-black">(Trường hợp này không có Khiêm nhường)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 1.5 - New */}
          <section>
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">2</span>
              Từ Vựng Giao Tiếp (Business)
            </h2>
            <div className="grid md:grid-cols-2 gap-6">

              <div className="border border-black dark:border-white p-5 rounded relative bg-slate-50 dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase mb-3">Phe "Người Ta" (Tôn Kính)</h3>
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Công ty họ:</span><span>貴社 (きしゃ) / 御社 (おんしゃ)</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Người (đại từ):</span><span>あの方 (あのかた)</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Ai (nghi vấn):</span><span>どなた / どちら様</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Gia đình họ:</span><span>ご家族, 奥様, ご主人, お子さん</span>
                  </div>
                </div>
              </div>

              <div className="border border-black dark:border-white p-5 rounded relative bg-slate-50 dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase mb-3">Phe "Mình" (Khiêm Nhường)</h3>
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Công ty mình:</span><span>弊社 (へいしゃ) / わたくしども</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Bản thân:</span><span>わたくし</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                    <span className="text-slate-500">Gia đình mình:</span><span>家内 (vợ), 夫 (chồng), 息子, 娘</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border border-black dark:border-white p-5 rounded relative bg-white dark:bg-black">
                <h3 className="text-sm font-black uppercase mb-2">Chuyển đổi thời gian / Từ đệm (Cực kỳ hay thi)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                  <div><span className="text-slate-500 block">Bây giờ:</span>ただいま</div>
                  <div><span className="text-slate-500 block">Hôm nay:</span>本日 (ほんじつ)</div>
                  <div><span className="text-slate-500 block">Ngày mai:</span>明日 (みょうにち)</div>
                  <div><span className="text-slate-500 block">Hôm qua:</span>昨日 (さくじつ)</div>
                  <div><span className="text-slate-500 block">Lúc nãy:</span>さきほど</div>
                  <div><span className="text-slate-500 block">Sau này:</span>のちほど</div>
                  <div><span className="text-slate-500 block">Ở đây:</span>こちら</div>
                  <div><span className="text-slate-500 block">Thế nào:</span>いかが</div>
                </div>
              </div>

            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">3</span>
              Hệ Thống Cấu Trúc Cơ Bản
            </h2>
            <div className="grid md:grid-cols-2 gap-6">

              <div className="border border-black dark:border-white p-5 rounded relative bg-slate-50 dark:bg-slate-900">
                <h3 className="text-lg font-black uppercase mb-3">TÔN KÍNH NGỮ</h3>
                <div className="bg-black text-white dark:bg-white dark:text-black font-black p-2 text-sm text-center mb-4">
                  NGƯỜI TRÊN thực hiện hành động
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="font-black text-sm border border-black dark:border-white px-1.5 rounded">1</span>
                    <div>
                      <p className="font-black text-sm">V-(ら)れる (Thể bị động)</p>
                      <p className="text-xs font-medium mt-0.5">社長は 出張されました。</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-black text-sm border border-black dark:border-white px-1.5 rounded">2</span>
                    <div>
                      <p className="font-black text-sm">お / ご + V(bỏ ます) + になる</p>
                      <p className="text-xs font-medium mt-0.5">先生は お帰りになりました。</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-black text-sm border border-black dark:border-white px-1.5 rounded">3</span>
                    <div>
                      <p className="font-black text-sm">お / ご + V(bỏ ます) + です</p>
                      <p className="text-xs font-medium mt-0.5">社長は お帰りです。<br /><span className="text-slate-500">(Chỉ trạng thái hiện tại đang xảy ra)</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-black dark:border-white p-5 rounded relative bg-slate-50 dark:bg-slate-900">
                <h3 className="text-lg font-black uppercase mb-3">KHIÊM NHƯỜNG NGỮ</h3>
                <div className="bg-black text-white dark:bg-white dark:text-black font-black p-2 text-sm text-center mb-4">
                  BẢN THÂN / PHE MÌNH thực hiện
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="font-black text-sm border border-black dark:border-white px-1.5 rounded">1</span>
                    <div>
                      <p className="font-black text-sm">お / ご + V(bỏ ます) + する</p>
                      <p className="text-xs font-medium mt-0.5">スケジュールを お送りします。</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-black text-sm border border-black dark:border-white px-1.5 rounded">2</span>
                    <div>
                      <p className="font-black text-sm">お / ご + V(bỏ ます) + いたします</p>
                      <p className="text-xs font-medium mt-0.5">Trang trọng hơn, hay dùng trong email công việc.</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-dashed border-slate-300 dark:border-slate-700 pt-3">
                    <p className="font-black text-sm mb-1">Mỹ Từ Ngữ (美化語)</p>
                    <p className="text-xs font-medium">Là việc thêm お/ご vào trước danh từ để làm lời nói đẹp hơn (không mang ý hạ mình hay tôn ai lên). Ví dụ: お金, お茶, ご飯, ご褒美 (phần thưởng).</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">4</span>
              Hệ Thống "Cho - Nhận" (授受表現)
            </h2>
            <p className="mb-4 font-bold text-sm border-l-2 border-black dark:border-white pl-3">Gốc rễ xử lý toàn bộ các dạng bài nhờ vả, làm hộ trong đề thi JLPT.</p>

            <div className="overflow-x-auto border border-black dark:border-white rounded">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-black text-white dark:bg-white dark:text-black uppercase text-xs">
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/4 font-black">Hướng hành động</th>
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/5 font-black">Cấu trúc gốc</th>
                    <th className="p-3 border-r border-slate-700 dark:border-slate-300 w-1/4 font-black">Kính Ngữ (Hay thi)</th>
                    <th className="p-3 font-black">Ý nghĩa logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black dark:divide-white bg-white dark:bg-black text-sm">
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">Mình → Sếp</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">～てあげる</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">～て差し上げる</td>
                    <td className="p-3 font-medium">Mình làm cho người trên <br /><span className="text-xs text-slate-500">(Hạn chế nói thẳng mặt vì dễ có cảm giác trịch thượng)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <td className="p-3 font-black border-r border-black dark:border-white">Sếp → Mình</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">～てくれる</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">～てくださる</td>
                    <td className="p-3 font-medium">Người trên làm cho mình.<br /><span className="font-black bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded text-[10px] mt-1 inline-block uppercase">Chủ ngữ = NGƯỜI TRÊN</span></td>
                  </tr>
                  <tr className="hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <td className="p-3 font-black border-r border-black dark:border-white">Mình ← Nhận từ Sếp</td>
                    <td className="p-3 font-bold border-r border-black dark:border-white">～てもらう</td>
                    <td className="p-3 font-black border-r border-black dark:border-white">～ていただく</td>
                    <td className="p-3 font-medium">Mình nhận hành động từ người trên.<br /><span className="font-black bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded text-[10px] mt-1 inline-block uppercase">Chủ ngữ = MÌNH</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">5</span>
              Combo Xin Phép & Nhờ Vả (Trùm Cuối)
            </h2>
            <p className="mb-6 font-black text-sm bg-black text-white dark:bg-white dark:text-black p-3 rounded text-center uppercase tracking-wide">
              Thể sai khiến (V-させる) + Thụ nhận
            </p>

            <div className="space-y-8">
              {/* Hệ Nhờ Vả */}
              <div className="border border-black dark:border-white rounded p-5 relative bg-white dark:bg-black">
                <div className="absolute -top-3 left-4 bg-white dark:bg-black px-2">
                  <h3 className="text-base font-black uppercase">1. HỆ NHỜ VẢ (Muốn Sếp làm)</h3>
                </div>
                <p className="font-bold border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 mb-4 text-sm">→ Hành động chính: <span className="underline uppercase tracking-wide">NGƯỜI TRÊN LÀM</span></p>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center border-b border-black dark:border-white pb-3">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Đuôi くれる</p>
                      <p className="font-black text-base">～てください <span className="font-normal mx-1">/</span> ～てくださいませんか</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Xin ngài hãy làm... cho tôi."</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center border-b border-black dark:border-white pb-3">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Đuôi もらう (いただく)</p>
                      <p className="font-black text-base leading-snug">
                        ～てもらえませんか <span className="font-normal mx-1">/</span><br className="md:hidden" />
                        ～ていただけませんか <span className="font-normal mx-1">/</span><br className="md:hidden" />
                        ～ていただけないでしょうか
                      </p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Ngài làm... cho tôi có được không?"</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Đuôi 欲しい (Muốn)</p>
                      <p className="font-black text-base">～ていただきたいんですが</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Tôi muốn nhờ ngài làm... (có được không ạ?)"</p>
                  </div>
                </div>
              </div>

              {/* Hệ Xin Phép */}
              <div className="border border-black dark:border-white rounded p-5 relative bg-white dark:bg-black mt-8">
                <div className="absolute -top-3 left-4 bg-white dark:bg-black px-2">
                  <h3 className="text-base font-black uppercase">2. HỆ XIN PHÉP (Mình muốn làm)</h3>
                </div>
                <p className="font-bold border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 mb-4 text-sm">→ Hành động chính: <span className="underline uppercase tracking-wide">BẢN THÂN MÌNH LÀM</span></p>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center border-b border-black dark:border-white pb-3">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Xin phép (Dạng câu hỏi)</p>
                      <p className="font-black text-base">～させていただけませんか<br />～させていただけないでしょうか</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Xin phép ngài cho TÔI làm... được không?"</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center border-b border-black dark:border-white pb-3">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Xin phép (Xác nhận quyền)</p>
                      <p className="font-black text-base">～させてもよろしいでしょうか</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"TÔI làm... có được không?"</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Tự quyết định thực hiện</p>
                      <p className="font-black text-base">～させていただきます</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"TÔI xin phép được làm..." <br />(Thông báo lịch sự, không cần đợi đồng ý).</p>
                  </div>
                </div>
              </div>

              {/* Hệ Đề Nghị */}
              <div className="border border-black dark:border-white rounded p-5 relative bg-white dark:bg-black mt-8">
                <div className="absolute -top-3 left-4 bg-white dark:bg-black px-2">
                  <h3 className="text-base font-black uppercase">3. HỆ ĐỀ NGHỊ (Mình làm giúp)</h3>
                </div>
                <p className="font-bold border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 mb-4 text-sm">→ Hành động chính: <span className="underline uppercase tracking-wide">BẢN THÂN MÌNH LÀM</span></p>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center border-b border-black dark:border-white pb-3">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Khiêm nhường thông thường</p>
                      <p className="font-black text-base">お / ご + V(bỏ ます) + します / いたします</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Để TÔI làm việc này cho ngài nhé."</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="md:w-1/2 shrink-0">
                      <p className="text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Đề nghị cao cấp</p>
                      <p className="font-black text-base">～（さ）せていただきましょうか</p>
                    </div>
                    <p className="text-sm font-bold md:w-1/2">"Để TÔI xin phép được làm giúp ngài nhé." (Lịch sự tối đa).</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Section 6 */}
          <section className="pt-4">
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">6</span>
              Lỗi Kính Ngữ Kép (二重敬語) - Bẫy Chết Người JLPT
            </h2>
            <div className="bg-white dark:bg-slate-900 p-5 rounded border border-black dark:border-white relative">
              <p className="font-bold text-sm mb-4">"Kính ngữ kép" là việc dùng 2 lần cấu trúc kính ngữ cho cùng 1 động từ. Trong tiếng Nhật, điều này là <span className="underline font-black text-black dark:text-white">SAI NGỮ PHÁP</span> và JLPT cực kỳ hay bẫy lỗi này.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-black dark:border-white p-4 rounded bg-slate-50 dark:bg-black/50">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded font-black text-xs">CÁCH SAI </span>
                    <span className="font-bold text-slate-500">Bị lặp 2 lần</span>
                  </div>
                  <ul className="space-y-2 text-sm font-black strike">
                    <li className="line-through decoration-2">おっしゃられる</li>
                    <li className="line-through decoration-2">ご覧になられる</li>
                    <li className="line-through decoration-2">お召し上がりになる</li>
                    <li className="line-through decoration-2">お越しになられる</li>
                  </ul>
                  <p className="text-xs font-bold text-slate-500 mt-2 italic">* Giải thích: "おっしゃる" bản thân đã là kính ngữ của "言う", mà lại còn chia tiếp thể bị động "(ら)れる" là dư thừa.</p>
                </div>

                <div className="border border-black dark:border-white p-4 rounded bg-slate-50 dark:bg-black/50">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded font-black text-xs">CÁCH ĐÚNG </span>
                    <span className="font-bold text-slate-500">Chỉ dùng 1 lần</span>
                  </div>
                  <ul className="space-y-2 text-sm font-black">
                    <li>おっしゃる / 言われる</li>
                    <li>ご覧になる / 見られる</li>
                    <li>召し上がる / 食べられる</li>
                    <li>お越しになる / 来られる</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="pt-4">
            <h2 className="text-lg md:text-xl font-black text-black dark:text-white mb-4 flex items-center gap-3 uppercase border-b border-black dark:border-white pb-2">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-base">7</span>
              Thần Chú JLPT "Bắt Bug" Nhanh
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded border border-black dark:border-white relative">
              <p className="font-black text-black dark:text-white mb-4 text-sm uppercase tracking-wide">BƯỚC CHỐT HẠ: KHÔNG DỊCH BỪA. TÌM NGAY XEM AI LÀ NGƯỜI LÀM HÀNH ĐỘNG.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center border-b border-slate-300 dark:border-slate-700 pb-3">
                  <div className="bg-black text-white dark:bg-white dark:text-black font-bold px-3 py-2 rounded md:min-w-[160px] text-center text-xs">
                    ～ていただく<br />～てくださる
                  </div>
                  <div className="font-bold text-base">⇒ NGƯỜI TRÊN làm.</div>
                </li>
                <li className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center border-b border-slate-300 dark:border-slate-700 pb-3">
                  <div className="bg-black text-white dark:bg-white dark:text-black font-bold px-3 py-2 rounded md:min-w-[160px] text-center text-xs">
                    ～させていただく
                  </div>
                  <div>
                    <div className="font-bold text-base">⇒ 100% MÌNH làm.</div>
                    <div className="font-medium text-xs mt-0.5 text-slate-600 dark:text-slate-400">(Bắt tôi làm + tôi nhận = Tôi xin phép làm)</div>
                  </div>
                </li>
                <li className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center border-b border-slate-300 dark:border-slate-700 pb-3">
                  <div className="bg-black text-white dark:bg-white dark:text-black font-bold px-3 py-2 rounded md:min-w-[160px] text-center text-xs">
                    お/ご... する<br />いたす / 申し上げる
                  </div>
                  <div className="font-bold text-base">⇒ 100% MÌNH làm.</div>
                </li>
                <li className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                  <div className="bg-black text-white dark:bg-white dark:text-black font-bold px-3 py-2 rounded md:min-w-[160px] text-center text-xs">
                    お/ご... になる<br />なさる
                  </div>
                  <div className="font-bold text-base">⇒ 100% NGƯỜI TRÊN làm.</div>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
