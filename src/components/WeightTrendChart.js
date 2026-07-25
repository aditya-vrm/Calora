'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTrendChart({ weightLogs = [], weightUnit = 'kg' }) {
  // Format logs for display
  const chartData = [...weightLogs]
    .reverse() // Sort chronologically (oldest to newest)
    .slice(-7) // Limit to last 7 entries for weekly review
    .map((log) => {
      const dateObj = new Date(log.date);
      const shortDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
      return {
        date: shortDate,
        Weight: parseFloat(log.weightVal.toFixed(1)),
      };
    });

  // Fallback if no records
  if (chartData.length === 0) {
    return (
      <div className="h-44 w-full flex items-center justify-center bg-white/2 border border-white/5 rounded-2xl">
        <span className="font-manrope text-xs font-semibold text-white/30 uppercase tracking-widest">
          No Weight Logs Registered
        </span>
      </div>
    );
  }

  // Custom Glass Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-white/10 rounded-xl py-2 px-3 shadow-lg shadow-black/40">
          <p className="font-manrope text-[10px] text-white/50 uppercase tracking-wider font-semibold">
            {payload[0].payload.date}
          </p>
          <p className="font-manrope text-sm font-extrabold text-accent-red-hover mt-0.5">
            {payload[0].value} {weightUnit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E50914" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#E50914" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.2)"
            fontSize={10}
            fontFamily="var(--font-manrope)"
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            fontSize={10}
            fontFamily="var(--font-manrope)"
            fontWeight={600}
            domain={['dataMin - 1', 'dataMax + 1']}
            tickLine={false}
            axisLine={false}
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Area
            type="monotone"
            dataKey="Weight"
            stroke="#E50914"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#weightGrad)"
            activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 1.5, fill: '#E50914' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
