export const APP_CSS = `
:root {
  --primary: #1a73e8;
  --primary-hover: #1765cc;
  --bg-app: #f8f9fa;
  --bg-card: #ffffff;
  --text-main: #202124;
  --text-muted: #5f6368;
  --border: #dadce0;
  --success: #1e8e3e;
  --warning: #f9ab00;
  --danger: #d93025;
  --sidebar-w: 240px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Google Sans', 'Roboto', sans-serif; background: var(--bg-app); color: var(--text-main); font-size: 14px; }
button { cursor: pointer; border: none; outline: none; border-radius: 4px; font-weight: 500; font-family: inherit; font-size: 13px; padding: 7px 16px; transition: background 0.15s; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: #fff; border: 1px solid var(--border); color: var(--text-main); }
.btn-secondary:hover { background: #f1f3f4; }
.btn-success { background: var(--success); color: #fff; }
.btn-danger { background: var(--danger); color: #fff; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
.badge-blue { background: #e8f0fe; color: var(--primary); }
.badge-green { background: #e6f4ea; color: var(--success); }
.badge-yellow { background: #fef7e0; color: #b06000; }
.badge-red { background: #fce8e6; color: var(--danger); }
.topbar { height: 56px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; position: sticky; top: 0; z-index: 100; }
.logo-group { display: flex; align-items: center; gap: 12px; }
.platform-pill { display: flex; background: #e8f0fe; border-radius: 20px; padding: 3px; border: 1px solid #c2e7ff; }
.platform-pill button { padding: 4px 14px; border-radius: 16px; font-size: 12px; background: transparent; color: #5f6368; }
.platform-pill button.active { background: var(--primary); color: #fff; }
.app-container { display: flex; min-height: calc(100vh - 56px); }
.sidebar { width: var(--sidebar-w); background: #fff; border-right: 1px solid var(--border); padding: 12px 0; flex-shrink: 0; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; color: var(--text-muted); cursor: pointer; border-radius: 0 20px 20px 0; margin-right: 12px; font-weight: 500; }
.nav-item:hover { background: #f1f3f4; color: var(--text-main); }
.nav-item.active { background: #e8f0fe; color: var(--primary); }
.content-area { flex: 1; padding: 24px 32px; overflow-y: auto; max-width: 1400px; }
.card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(60,64,67,0.1); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-title { font-size: 18px; font-weight: 500; }
.grid-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
.kpi-card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 16px; border-left: 4px solid var(--primary); }
.kpi-value { font-size: 26px; font-weight: 700; margin: 8px 0; }
.kpi-label { color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 500; }
table.data-table { width: 100%; border-collapse: collapse; text-align: left; }
table.data-table th { background: #f8f9fa; border-bottom: 2px solid var(--border); padding: 10px 14px; font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
table.data-table td { border-bottom: 1px solid var(--border); padding: 12px 14px; }
table.data-table tr:hover { background: #f8f9fa; }
.pulse-circle { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 rgba(30,142,62, 0.4); animation: pulse 1.8s infinite; margin-right: 6px; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(30,142,62, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(30,142,62, 0); } 100% { box-shadow: 0 0 0 0 rgba(30,142,62, 0); } }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: #fff; border-radius: 8px; width: 540px; max-width: 95vw; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 4px; font-family: inherit; font-size: 14px; }
.bar-chart-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.bar-chart-label { width: 140px; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-chart-track { flex: 1; height: 20px; background: #f1f3f4; border-radius: 4px; overflow: hidden; }
.bar-chart-fill { height: 100%; background: var(--primary); border-radius: 4px; min-width: 4px; transition: width 0.3s; }
.notification-banner { position: fixed; bottom: 24px; right: 24px; background: #323232; color: #fff; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; font-size: 14px; animation: slideUp 0.2s ease-out; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
