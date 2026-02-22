import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Heart, Users, DollarSign,
    Calendar, ChevronDown, Info, Sparkles
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getUserPerformance } from '../api';
import { editorTips } from '../data/tips';
import { PerformanceSkeleton } from '../components/Skeleton';

const Performance = () => {
    const { token } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState(searchParams.get('metric') || 'views');
    const [activeRange, setActiveRange] = useState(7); // Default to 7 days as requested
    const [activeTipIndex, setActiveTipIndex] = useState(Math.floor(Math.random() * editorTips.length));

    const metrics = [
        { id: 'views', label: 'Total Views', icon: TrendingUp, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
        { id: 'likes', label: 'Total Likes', icon: Heart, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
        { id: 'followers', label: 'Followers', icon: Users, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
        { id: 'earnings', label: 'Earnings', icon: DollarSign, color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    ];

    const currentMetricInfo = metrics.find(m => m.id === activeMetric) || metrics[0];

    useEffect(() => {
        const fetchPerformance = async () => {
            setLoading(true);
            try {
                const result = await getUserPerformance(token, activeMetric, activeRange);
                // Format dates for display
                const formattedData = result.data.map(item => ({
                    ...item,
                    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }));
                setData(formattedData);
            } catch (err) {
                console.error("Error fetching performance data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPerformance();
        }
    }, [token, activeMetric, activeRange]);

    const handleMetricChange = (metricId) => {
        setActiveMetric(metricId);
        setSearchParams({ metric: metricId });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</p>
                    <p style={{
                        margin: '4px 0 0',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: payload[0].color
                    }}>
                        {activeMetric === 'earnings' ? `$${payload[0].value.toFixed(2)}` : payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const statsSummary = useMemo(() => {
        if (!data.length) return { total: 0, growth: 0, lastValue: 0 };
        const total = data.reduce((sum, item) => sum + item[activeMetric], 0);
        const lastValue = data[data.length - 1][activeMetric];
        const firstValue = data[0][activeMetric];
        const growth = firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100;
        return { total, growth, lastValue };
    }, [data, activeMetric]);

    if (loading && !data.length) {
        return <PerformanceSkeleton />;
    }

    return (
        <div className="performance-page page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="performance-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                <button
                    onClick={() => navigate('/insights')}
                    className="glass hover-scale"
                    style={{
                        width: '45px', height: '45px', borderRadius: '50%', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <TrendingUp size={14} />
                        Growth Analytics
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Performance</h1>
                </div>

                <div className="range-selector glass" style={{
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '4px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {[7, 30].map(range => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: activeRange === range ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: activeRange === range ? 'white' : 'var(--text-secondary)',
                                border: 'none'
                            }}
                        >
                            {range}D
                        </button>
                    ))}
                </div>
            </div>

            <div className="performance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div className="main-chart-section">
                    <div className="metric-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {metrics.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleMetricChange(m.id)}
                                className={activeMetric === m.id ? 'glass active-metric' : 'glass'}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: activeMetric === m.id ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.05)',
                                    background: activeMetric === m.id ? `rgba(${parseInt(m.color.slice(1, 3), 16)}, ${parseInt(m.color.slice(3, 5), 16)}, ${parseInt(m.color.slice(5, 7), 16)}, 0.1)` : 'rgba(255,255,255,0.02)',
                                    color: activeMetric === m.id ? 'white' : 'var(--text-secondary)',
                                }}
                            >
                                <m.icon size={18} color={activeMetric === m.id ? m.color : 'currentColor'} />
                                <span style={{ fontWeight: 600 }}>{m.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="chart-container glass" style={{
                        padding: '2rem',
                        borderRadius: '32px',
                        height: '500px',
                        position: 'relative',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px' }}>
                                    {activeMetric === 'earnings' ? `$${statsSummary.lastValue.toFixed(2)}` : statsSummary.lastValue.toLocaleString()}
                                </div>
                                <div style={{
                                    color: statsSummary.growth >= 0 ? '#10b981' : '#ef4444',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {statsSummary.growth >= 0 ? '+' : ''}{statsSummary.growth.toFixed(1)}%
                                    <Sparkles size={14} />
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Today's {currentMetricInfo.label}</div>
                        </div>

                        <ResponsiveContainer width="100%" height="70%">
                            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={currentMetricInfo.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={currentMetricInfo.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    hide
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey={activeMetric}
                                    stroke={currentMetricInfo.color}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMetric)"
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={activeMetric}
                                    stroke={currentMetricInfo.color}
                                    strokeWidth={0}
                                    dot={{ r: 4, fill: currentMetricInfo.color, strokeWidth: 2, stroke: '#000' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="insights-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Info size={18} color="var(--accent-primary)" />
                            Quick Insights
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Highest Growth Day</div>
                                <div style={{ fontWeight: 700 }}>Feb 12, 2026</div>
                                <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+24.5% vs average</div>
                            </div>
                            <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Monthly Total</div>
                                <div style={{ fontWeight: 700 }}>
                                    {activeMetric === 'earnings' ? `$${statsSummary.total.toFixed(2)}` : statsSummary.total.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTipIndex((prev) => (prev + 1) % editorTips.length)}
                        className="glass hover-scale"
                        style={{
                            padding: '1.5rem',
                            borderRadius: '24px',
                            background: `linear-gradient(135deg, ${editorTips[activeTipIndex].color}15 0%, rgba(0,0,0,0) 100%)`,
                            border: '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: `${editorTips[activeTipIndex].color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {React.createElement(editorTips[activeTipIndex].icon, {
                                    size: 18,
                                    color: editorTips[activeTipIndex].color
                                })}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{editorTips[activeTipIndex].title}</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                            {editorTips[activeTipIndex].content}
                        </p>
                        <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            right: '1rem',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.2)',
                            fontWeight: 600
                        }}>
                            TAP TO CYCLE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Performance;
