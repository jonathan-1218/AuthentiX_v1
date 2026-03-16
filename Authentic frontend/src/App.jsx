import {
  Activity,
  AlertTriangle,
  Bot,
  Cpu,
  Gauge,
  MessageSquare,
  Radar,
  ShieldCheck,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from 'recharts';

const sensorFeed = [
  { time: '08:00', temperature: 24, humidity: 58, vibration: 18 },
  { time: '09:00', temperature: 25, humidity: 60, vibration: 22 },
  { time: '10:00', temperature: 27, humidity: 57, vibration: 29 },
  { time: '11:00', temperature: 29, humidity: 54, vibration: 34 },
  { time: '12:00', temperature: 30, humidity: 52, vibration: 26 },
  { time: '13:00', temperature: 28, humidity: 55, vibration: 21 },
  { time: '14:00', temperature: 26, humidity: 59, vibration: 19 },
];

const healthBreakdown = [
  { name: 'Healthy', value: 72, color: '#22c55e' },
  { name: 'Warning', value: 19, color: '#f59e0b' },
  { name: 'Critical', value: 9, color: '#ef4444' },
];

const zoneActivity = [
  { zone: 'North Wing', alerts: 3 },
  { zone: 'Factory A', alerts: 7 },
  { zone: 'Storage', alerts: 2 },
  { zone: 'Cooling', alerts: 5 },
];

const metrics = [
  {
    label: 'Active sensors',
    value: '128',
    change: '+12%',
    tone: 'positive',
    icon: Radar,
  },
  {
    label: 'Critical alerts',
    value: '09',
    change: '-3%',
    tone: 'negative',
    icon: AlertTriangle,
  },
  {
    label: 'System uptime',
    value: '99.94%',
    change: '+0.4%',
    tone: 'positive',
    icon: ShieldCheck,
  },
  {
    label: 'AI responses',
    value: '342',
    change: '+18%',
    tone: 'positive',
    icon: Bot,
  },
];

const liveSensors = [
  { name: 'Thermal node 04', reading: '29°C', status: 'Stable', icon: Thermometer },
  { name: 'Flow meter 11', reading: '84 L/min', status: 'Rising', icon: Waves },
  { name: 'Air quality 02', reading: '412 ppm', status: 'Nominal', icon: Wind },
  { name: 'Machine load 09', reading: '61%', status: 'Watch', icon: Cpu },
];

const chatMessages = [
  {
    role: 'assistant',
    author: 'Ops AI',
    text: 'Factory A vibration exceeded baseline by 11%. Recommend maintenance inspection within 2 hours.',
  },
  {
    role: 'user',
    author: 'Control Room',
    text: 'Any linked environmental changes?',
  },
  {
    role: 'assistant',
    author: 'Ops AI',
    text: 'Humidity dropped 6% in the same interval, likely increasing motor stress and heat buildup.',
  },
];

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Authentic Monitor</p>
          <h1>Sensor Intelligence Hub</h1>
        </div>

        <nav className="nav-list">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Sensor Streams</button>
          <button className="nav-item">AI Chat</button>
          <button className="nav-item">Incident Log</button>
          <button className="nav-item">Reports</button>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <Gauge size={18} />
            <span>Network health</span>
          </div>
          <strong>97.8%</strong>
          <p>2 offline nodes detected. Auto-retry in progress.</p>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Real-time command center</p>
            <h2>Sensor dashboard and operational chat</h2>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Live ingest active
          </div>
        </header>

        <section className="metric-grid">
          {metrics.map(({ label, value, change, tone, icon: Icon }) => (
            <article className="metric-card" key={label}>
              <div className="metric-head">
                <span>{label}</span>
                <Icon size={18} />
              </div>
              <strong>{value}</strong>
              <p className={tone === 'positive' ? 'trend up' : 'trend down'}>{change} from last cycle</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel chart-panel wide-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Infographics</p>
                <h3>Environmental sensor trends</h3>
              </div>
              <Activity size={18} />
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorFeed}>
                  <defs>
                    <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 16,
                    }}
                  />
                  <Area type="monotone" dataKey="temperature" stroke="#60a5fa" fill="url(#tempFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="humidity" stroke="#34d399" fill="url(#humidityFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Health</p>
                <h3>Sensor status mix</h3>
              </div>
            </div>
            <div className="chart-wrap small">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={86} paddingAngle={4}>
                    {healthBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 16,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend-list">
              {healthBreakdown.map((item) => (
                <div className="legend-item" key={item.name}>
                  <span className="legend-color" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Live feed</p>
                <h3>Current sensor inputs</h3>
              </div>
            </div>
            <div className="sensor-list">
              {liveSensors.map(({ name, reading, status, icon: Icon }) => (
                <div className="sensor-item" key={name}>
                  <div className="sensor-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <strong>{name}</strong>
                    <p>{reading}</p>
                  </div>
                  <span className="badge">{status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Zones</p>
                <h3>Alert concentration</h3>
              </div>
              <MessageSquare size={18} />
            </div>
            <div className="chart-wrap medium">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneActivity}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="zone" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 16,
                    }}
                  />
                  <Bar dataKey="alerts" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel wide-panel chat-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Chat</p>
                <h3>Operational assistant</h3>
              </div>
              <Bot size={18} />
            </div>
            <div className="chat-list">
              {chatMessages.map((message, index) => (
                <div className={`chat-bubble ${message.role}`} key={`${message.author}-${index}`}>
                  <span>{message.author}</span>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input type="text" value="Summarize priority incidents for the next shift..." readOnly />
              <button type="button">Send</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
