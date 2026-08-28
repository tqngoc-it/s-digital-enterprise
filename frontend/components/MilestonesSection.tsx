import { CheckCircle2, TrendingUp, Award, Zap } from 'lucide-react';
import { StatItem } from '@/lib/fallbackData';

interface MilestonesSectionProps {
  stats?: StatItem[];
}

export default function MilestonesSection({ stats }: MilestonesSectionProps) {
  const defaultMilestones = [
    {
      value: '95%',
      label: 'Khách Hàng Hài Lòng',
      desc: 'Tỷ lệ khách hàng đánh giá dịch vụ xuất sắc và quay lại hợp tác.',
      icon: CheckCircle2,
      color: 'text-[#FF5722]',
      border: 'hover:border-[#FF5722]/50',
      glow: 'group-hover:shadow-[#FF5722]/10',
    },
    {
      value: '80%',
      label: 'Tăng Trưởng ROI',
      desc: 'Mức tăng trưởng trung bình về lợi nhuận đầu tư cho các chiến dịch quảng cáo.',
      icon: TrendingUp,
      color: 'text-[#00E5FF]',
      border: 'hover:border-[#00E5FF]/50',
      glow: 'group-hover:shadow-[#00E5FF]/10',
    },
    {
      value: '90%',
      label: 'Dự Án Thành Công',
      desc: 'Tỷ lệ dự án hoàn thành đúng hạn và đạt mục tiêu đề ra.',
      icon: Award,
      color: 'text-[#10B981]',
      border: 'hover:border-[#10B981]/50',
      glow: 'group-hover:shadow-[#10B981]/10',
    },
    {
      value: '85%',
      label: 'Tăng Nhận Diện',
      desc: 'Mức tăng trưởng trung bình về độ nhận diện thương hiệu sau các chiến dịch.',
      icon: Zap,
      color: 'text-amber-400',
      border: 'hover:border-amber-400/50',
      glow: 'group-hover:shadow-amber-400/10',
    },
  ];

  const milestonesToRender = stats && stats.length === 4
    ? stats.map((s, i) => ({
        ...defaultMilestones[i],
        value: s.value || defaultMilestones[i].value,
        label: s.label || defaultMilestones[i].label,
        desc: s.desc || defaultMilestones[i].desc,
      }))
    : defaultMilestones;

  return (
    <section id="milestones" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#FF5722] text-xs font-mono tracking-widest uppercase font-bold">
          PROVEN TRACK RECORD & STATS
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white">Thành Tựu Nổi Bật</h2>
        <p className="text-xs md:text-sm text-slate-400">
          Hiệu quả thực chiến được chứng minh qua hàng trăm chiến dịch truyền thông và sự kiện thể thao quy mô lớn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {milestonesToRender.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-8 rounded-3xl bg-[#0B111E] border border-white/10 ${item.border} transition-all space-y-4 text-left group hover:-translate-y-1.5 duration-300 shadow-xl ${item.glow}`}
            >
              <div className="flex items-center justify-between">
                <div className={`text-4xl lg:text-5xl font-black ${item.color} tracking-tight`}>
                  {item.value}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                </div>
              </div>
              <h3 className="font-bold text-white text-base pt-2">{item.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
