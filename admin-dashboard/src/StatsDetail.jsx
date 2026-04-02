import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerformanceStats } from './api';
import { ChevronLeft, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const StatsDetail = ({ token }) => {
    const { metric } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const metricLabels = {
        users: 'Total Members',
        videos: 'Total Videos',
        premium: 'Premium Members',
        views: 'Platform Views'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const stats = await getPerformanceStats(metric, token);
                // Format data for Recharts: Ensure dates are readable
                const formatted = stats.map(item => ({
                    ...item,
                    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }));
                setData(formatted);
            } catch (err) {
                console.error("Failed to fetch performance stats", err);
                setError("Could not load historical data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [metric, token]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-subtle)', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    boxShadow: 'var(--shadow-md)' 
                }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>
                        {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div style={{ background: 'var(--bg-app)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
            <header style={{ 
                height: '72px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '8px' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="jakarta" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        {metricLabels[metric] || 'Analytics'} Growth
                    </h1>
                </div>
            </header>

            <main className="container" style={{ padding: '40px 0' }}>
                {error ? (
                    <div className="card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
                        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                            {/* Chart Card */}
                            <div className="card" style={{ padding: '32px', height: '500px' }}>
                                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Performance Overview</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Daily growth trajectory over the last 30 days</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>
                                        <TrendingUp size={18} /> Growing
                                    </div>
                                </div>
                                
                                <div style={{ width: '100%', height: '350px' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                            <XAxis 
                                                dataKey="displayDate" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                                tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke="var(--accent)" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorValue)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="card" style={{ padding: '24px' }}>
                                    <Calendar size={20} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period</p>
                                    <p style={{ fontSize: '18px', fontWeight: 800 }}>Last 30 Days</p>
                                </div>
                                
                                <div className="card" style={{ padding: '24px' }}>
                                    <TrendingUp size={20} color="var(--accent)" style={{ marginBottom: '16px' }} />
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Total</p>
                                    <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>
                                        {data.length > 0 ? data[data.length - 1].value.toLocaleString() : '0'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default StatsDetail;
